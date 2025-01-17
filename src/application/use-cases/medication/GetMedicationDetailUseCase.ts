// src/application/use-cases/medication/GetMedicationDetailUseCase.ts
import { MedicationService } from '@/domain/services/MedicationService';
import { MedicationResponse } from '@/application/dtos/MedicationDTO';

export class GetMedicationDetailUseCase {
  constructor(private readonly medicationService: MedicationService) { }

  /**
   * Execute the get medication detail use case
   * @param id Medication ID
   * @returns Medication details
   * @throws Error if medication is not found or fetching fails
   */
  async execute(id: string): Promise<MedicationResponse> {
    return this.medicationService.getMedicationById(id)
      .then(medication => {
        if (!medication) {
          throw new Error('Medication not found');
        }

        return {
          id: medication.id,
          brandName: medication.brandName,
          genericName: medication.genericName,
          labelerName: medication.labelerName,
          activeIngredients: medication.activeIngredients,
          route: medication.routes[0] || '',
          packaging: medication.packaging.map(p => p.description)
        };
      })
      .catch((error: Error) => {
        throw new Error(`Failed to fetch medication: ${error.message}`);
      });
  }
}
