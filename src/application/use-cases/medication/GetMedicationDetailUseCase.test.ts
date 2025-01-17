// src/application/use-cases/medication/GetMedicationDetailUseCase.test.ts
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { GetMedicationDetailUseCase } from './GetMedicationDetailUseCase';
import { MedicationService } from '@/domain/services/MedicationService';
import { Medication } from '@/domain/entities/Medication';

describe('GetMedicationDetailUseCase', () => {
  let getMedicationDetailUseCase: GetMedicationDetailUseCase;
  let mockMedicationService: MedicationService;

  const mockMedication = new Medication(
    '1',
    'Test Medicine',
    'Test Generic',
    'Test Lab',
    [{ name: 'Test Ingredient', strength: '10mg' }],
    ['ORAL'],
    [{ description: 'bottle', marketingStartDate: '20240101' }]
  );

  beforeEach(() => {
    mockMedicationService = {
      getMedicationById: mock(() => Promise.resolve(mockMedication))
    } as any;

    getMedicationDetailUseCase = new GetMedicationDetailUseCase(mockMedicationService);
  });

  it('should return medication details for valid ID', async () => {
    const result = await getMedicationDetailUseCase.execute('1');

    expect(result).toEqual({
      id: '1',
      brandName: 'Test Medicine',
      genericName: 'Test Generic',
      labelerName: 'Test Lab',
      activeIngredients: [{ name: 'Test Ingredient', strength: '10mg' }],
      route: 'ORAL',
      packaging: ['bottle']
    });
    expect(mockMedicationService.getMedicationById).toHaveBeenCalledWith('1');
  });

  it('should handle non-existent medication', async () => {
    mockMedicationService.getMedicationById = mock(() =>
      Promise.resolve(null)
    );

    expect(getMedicationDetailUseCase.execute('nonexistent'))
      .rejects
      .toThrow('Failed to fetch medication: Medication not found');
  });

  it('should handle service errors', async () => {
    mockMedicationService.getMedicationById = mock(() =>
      Promise.reject(new Error('Service error'))
    );

    expect(getMedicationDetailUseCase.execute('1'))
      .rejects
      .toThrow('Failed to fetch medication: Service error');
  });

  it('should handle medication with no routes', async () => {
    const medicationNoRoutes = new Medication(
      '2',
      'Test Medicine',
      'Test Generic',
      'Test Lab',
      [{ name: 'Test Ingredient', strength: '10mg' }],
      [],
      [{ description: 'bottle', marketingStartDate: '20240101' }]
    );

    mockMedicationService.getMedicationById = mock(() =>
      Promise.resolve(medicationNoRoutes)
    );

    const result = await getMedicationDetailUseCase.execute('2');

    expect(result.route).toBe('');
  });
});
