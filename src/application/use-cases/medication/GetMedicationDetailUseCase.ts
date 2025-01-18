// src/application/use-cases/medication/GetMedicationDetailUseCase.ts
import { MedicationService } from '@/domain/services/MedicationService';
import { MedicationResponse } from '@/application/dtos/MedicationDTO';

/**
 * Use case for retrieving detailed information about a specific medication
 */
export class GetMedicationDetailUseCase {
  /**
   * Creates a new instance of GetMedicationDetailUseCase
   * @param medicationService - The medication service dependency
   */
  constructor(private readonly medicationService: MedicationService) { }

  /**
   * Executes the get medication detail use case
   * @param id - Unique identifier of the medication to retrieve
   * @returns Promise that resolves to medication details in DTO format
   * @throws Error if medication is not found or if the fetch operation fails
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
