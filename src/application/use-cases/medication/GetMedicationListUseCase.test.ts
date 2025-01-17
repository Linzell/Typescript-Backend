// src/application/use-cases/medication/GetMedicationListUseCase.test.ts
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { GetMedicationListUseCase } from './GetMedicationListUseCase';
import { MedicationService } from '@/domain/services/MedicationService';
import { Medication } from '@/domain/entities/Medication';
import { MedicationFilter } from '@/application/dtos/MedicationDTO';

describe('GetMedicationListUseCase', () => {
  let getMedicationListUseCase: GetMedicationListUseCase;
  let mockMedicationService: MedicationService;

  const mockMedication = new Medication(
    '1',
    'Test Medicine',
    'Test Generic',
    'Test Lab',
    [{ name: 'Ibuprofen', strength: '10mg' }],
    ['ORAL'],
    [{ description: 'bottle', marketingStartDate: '20240101' }]
  );

  const mockPaginatedResponse = {
    medications: [mockMedication],
    total: 1,
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  };

  beforeEach(() => {
    mockMedicationService = {
      getMedications: mock(() => Promise.resolve(mockPaginatedResponse)),
      searchByActiveIngredient: mock(() => Promise.resolve(mockPaginatedResponse)),
      filterByRoute: mock(() => Promise.resolve(mockPaginatedResponse)),
      searchByIngredientAndRoute: mock(() => Promise.resolve(mockPaginatedResponse))
    } as unknown as MedicationService;

    getMedicationListUseCase = new GetMedicationListUseCase(mockMedicationService);
  });

  it('should call searchByIngredientAndRoute when both filters are present', async () => {
    const filters: MedicationFilter = {
      page: 1,
      limit: 10,
      activeIngredient: 'Ibuprofen',
      route: 'ORAL'
    };

    await getMedicationListUseCase.execute(filters);

    expect(mockMedicationService.searchByIngredientAndRoute)
      .toHaveBeenCalledWith('Ibuprofen', 'ORAL', 1, 10);
  });

  it('should call searchByActiveIngredient when only ingredient filter is present', async () => {
    const filters: MedicationFilter = {
      page: 1,
      limit: 10,
      activeIngredient: 'Ibuprofen'
    };

    await getMedicationListUseCase.execute(filters);

    expect(mockMedicationService.searchByActiveIngredient)
      .toHaveBeenCalledWith('Ibuprofen', 1, 10);
  });

  it('should call filterByRoute when only route filter is present', async () => {
    const filters: MedicationFilter = {
      page: 1,
      limit: 10,
      route: 'ORAL'
    };

    await getMedicationListUseCase.execute(filters);

    expect(mockMedicationService.filterByRoute)
      .toHaveBeenCalledWith('ORAL', 1, 10);
  });

  it('should call getMedications when no filters are present', async () => {
    const filters: MedicationFilter = {
      page: 1,
      limit: 10
    };

    await getMedicationListUseCase.execute(filters);

    expect(mockMedicationService.getMedications)
      .toHaveBeenCalledWith(filters);
  });

  it('should handle service errors', async () => {
    mockMedicationService.getMedications = mock(() =>
      Promise.reject(new Error('Service error'))
    );

    const filters: MedicationFilter = {
      page: 1,
      limit: 10
    };

    expect(getMedicationListUseCase.execute(filters))
      .rejects
      .toThrow('Failed to fetch medications: Service error');
  });

  it('should format response correctly', async () => {
    const filters: MedicationFilter = {
      page: 1,
      limit: 10
    };

    const result = await getMedicationListUseCase.execute(filters);

    expect(result).toEqual({
      medications: [{
        id: '1',
        brandName: 'Test Medicine',
        genericName: 'Test Generic',
        labelerName: 'Test Lab',
        activeIngredients: [{ name: 'Ibuprofen', strength: '10mg' }],
        route: 'ORAL',
        packaging: ['bottle']
      }],
      total: 1,
      currentPage: 1,
      totalPages: 1,
      hasMore: false
    });
  });
});
