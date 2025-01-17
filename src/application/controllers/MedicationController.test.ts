// src/application/controllers/MedicationController.test.ts
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { MedicationController } from './MedicationController';
import { MedicationService } from '@/domain/services/MedicationService';
import { Medication } from '@/domain/entities/Medication';
import { MedicationFilter } from '../dtos/MedicationDTO';

describe('MedicationController', () => {
  let medicationController: MedicationController;
  let mockMedicationService: MedicationService;

  const mockMedication = new Medication(
    '1',
    'Test Medicine',
    'Test Generic',
    'Test Lab',
    [{ name: 'Test Ingredient', strength: '10mg' }],
    ['ORAL'],
    [{ description: 'bottle', marketingStartDate: '20240101', sample: false }]
  );

  const mockPaginatedResponse = {
    medications: [{
      id: '1',
      brandName: 'Test Medicine',
      genericName: 'Test Generic',
      labelerName: 'Test Lab',
      activeIngredients: [{ name: 'Test Ingredient', strength: '10mg' }],
      route: 'ORAL',
      packaging: ['bottle']
    }],
    total: 1,
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  };

  beforeEach(() => {
    mockMedicationService = new MedicationService({
      findMedications: mock(() => Promise.resolve({
        medications: [mockMedication],
        total: 1
      })),
      findById: mock(() => Promise.resolve(mockMedication))
    });

    medicationController = new MedicationController(mockMedicationService);
  });

  describe('getMedications', () => {
    it('should return paginated medications list', async () => {
      const filters: MedicationFilter = {
        page: 1,
        limit: 10,
        activeIngredient: 'Test',
        route: 'ORAL'
      };

      return medicationController.getMedications(filters)
        .then(result => {
          expect(result).toEqual(mockPaginatedResponse);
        });
    });

    it('should handle service errors', async () => {
      const filters: MedicationFilter = { page: 1, limit: 10 };
      mockMedicationService.getMedications = mock(() =>
        Promise.reject(new Error('Service error'))
      );

      return medicationController.getMedications(filters)
        .catch(error => {
          expect(error.message).toBe('Failed to fetch medications: Service error');
        });
    });

    it('should validate page number', async () => {
      const filters = {
        page: -1,
        limit: 10
      } as MedicationFilter;

      return medicationController.getMedications(filters)
        .catch(error => {
          expect(error.message).toContain('Number must be greater than or equal to 1');
        });
    });

    it('should validate limit', async () => {
      const filters = {
        page: 1,
        limit: -10
      } as MedicationFilter;

      return medicationController.getMedications(filters)
        .catch(error => {
          expect(error.message).toContain('Number must be greater than or equal to 1');
        });
    });
  });

  describe('getMedicationById', () => {
    it('should return medication details by id', async () => {
      const expectedResponse = {
        id: '1',
        brandName: 'Test Medicine',
        genericName: 'Test Generic',
        labelerName: 'Test Lab',
        activeIngredients: [{ name: 'Test Ingredient', strength: '10mg' }],
        route: 'ORAL',
        packaging: ['bottle']
      };

      return medicationController.getMedicationById('1')
        .then(result => {
          expect(result).toEqual(expectedResponse);
        });
    });

    it('should throw error when medication is not found', async () => {
      mockMedicationService = new MedicationService({
        findMedications: mock(() => Promise.resolve({ medications: [], total: 0 })),
        findById: mock(() => Promise.resolve(null))
      });

      medicationController = new MedicationController(mockMedicationService);

      return medicationController.getMedicationById('nonexistent')
        .catch(error => {
          expect(error.message).toBe('Failed to fetch medication: Medication not found');
        });
    });

    it('should handle service errors', async () => {
      mockMedicationService = new MedicationService({
        findMedications: mock(() => Promise.resolve({ medications: [], total: 0 })),
        findById: mock(() => Promise.reject(new Error('Service error')))
      });

      medicationController = new MedicationController(mockMedicationService);

      return medicationController.getMedicationById('1')
        .catch(error => {
          expect(error.message).toBe('Failed to fetch medication: Failed to fetch medication with ID 1: Service error');
        });
    });
  });
});
