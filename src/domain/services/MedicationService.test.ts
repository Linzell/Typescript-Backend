// src/domain/services/MedicationService.test.ts
import { expect, test, mock, beforeEach, describe } from "bun:test";
import { MedicationService, MedicationError } from "./MedicationService";
import { Medication } from "@/domain/entities/Medication";
import { IMedicationRepository, MedicationFilters } from "@/domain/repositories/IMedicationRepository";

describe('MedicationService', () => {
  let medicationService: MedicationService;
  let mockMedicationRepository: IMedicationRepository;

  const mockMedication = Medication.create({
    id: '1',
    brandName: 'Test Med',
    genericName: 'Test Generic',
    labelerName: 'Test Lab',
    activeIngredients: [
      { name: 'Ingredient 1', strength: '10mg' }
    ],
    routes: ['ORAL'],
    packaging: [
      { description: 'Bottle of 30 tablets' }
    ]
  });

  const mockPaginatedResponse = {
    medications: [mockMedication],
    total: 1,
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  };

  beforeEach(() => {
    mockMedicationRepository = {
      findMedications: mock(() =>
        Promise.resolve({ medications: [mockMedication], total: 1 })
      ),
      findById: mock(() => Promise.resolve(mockMedication))
    };

    medicationService = new MedicationService(mockMedicationRepository);
  });

  describe('getMedications', () => {
    test('should return paginated medications', async () => {
      const filters: MedicationFilters = {
        page: 1,
        limit: 10
      };

      const result = await medicationService.getMedications(filters);

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockMedicationRepository.findMedications).toHaveBeenCalledWith(filters);
    });

    test('should handle repository errors', async () => {
      const filters: MedicationFilters = {
        page: 1,
        limit: 10
      };

      mockMedicationRepository.findMedications = mock(() =>
        Promise.reject(new Error('Repository error'))
      );

      expect(medicationService.getMedications(filters))
        .rejects
        .toThrow(MedicationError);
    });
  });

  describe('getMedicationById', () => {
    test('should return medication by id', async () => {
      const result = await medicationService.getMedicationById('1');

      expect(result).toEqual(mockMedication);
      expect(mockMedicationRepository.findById).toHaveBeenCalledWith('1');
    });

    test('should return null for non-existent medication', async () => {
      mockMedicationRepository.findById = mock(() => Promise.resolve(null));

      const result = await medicationService.getMedicationById('999');

      expect(result).toBeNull();
    });

    test('should handle repository errors', async () => {
      mockMedicationRepository.findById = mock(() =>
        Promise.reject(new Error('Repository error'))
      );

      expect(medicationService.getMedicationById('1'))
        .rejects
        .toThrow(MedicationError);
    });
  });

  describe('searchByActiveIngredient', () => {
    test('should return medications filtered by active ingredient', async () => {
      const result = await medicationService.searchByActiveIngredient('Ingredient 1');

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockMedicationRepository.findMedications).toHaveBeenCalledWith({
        activeIngredient: 'Ingredient 1',
        page: 1,
        limit: 10
      });
    });
  });

  describe('filterByRoute', () => {
    test('should return medications filtered by route', async () => {
      const result = await medicationService.filterByRoute('ORAL');

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockMedicationRepository.findMedications).toHaveBeenCalledWith({
        route: 'ORAL',
        page: 1,
        limit: 10
      });
    });
  });

  describe('searchByIngredientAndRoute', () => {
    test('should return medications filtered by ingredient and route', async () => {
      const result = await medicationService.searchByIngredientAndRoute(
        'Ingredient 1',
        'ORAL'
      );

      expect(result).toEqual(mockPaginatedResponse);
      expect(mockMedicationRepository.findMedications).toHaveBeenCalledWith({
        activeIngredient: 'Ingredient 1',
        route: 'ORAL',
        page: 1,
        limit: 10
      });
    });

    test('should use custom pagination parameters', async () => {
      await medicationService.searchByIngredientAndRoute(
        'Ingredient 1',
        'ORAL',
        2,
        20
      );

      expect(mockMedicationRepository.findMedications).toHaveBeenCalledWith({
        activeIngredient: 'Ingredient 1',
        route: 'ORAL',
        page: 2,
        limit: 20
      });
    });
  });

  describe('MedicationError', () => {
    test('should create error with correct properties', () => {
      const error = new MedicationError('Test error', 'TEST_ERROR', 400);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('MedicationError');
    });

    test('should use default status code if not provided', () => {
      const error = new MedicationError('Test error', 'TEST_ERROR');

      expect(error.statusCode).toBe(500);
    });
  });
});
