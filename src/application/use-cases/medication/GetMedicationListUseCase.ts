// src/application/use-cases/medication/GetMedicationListUseCase.ts
import { MedicationService } from '@/domain/services/MedicationService';
import { MedicationFilter, PaginatedMedicationResponse, MedicationResponse } from '@/application/dtos/MedicationDTO';
import { Medication } from '@/domain/entities/Medication';

export class GetMedicationListUseCase {
  constructor(private readonly medicationService: MedicationService) { }

  /**
   * Maps a Medication entity to MedicationResponse DTO
   * @param medication Medication entity
   * @returns MedicationResponse DTO
   */
  private mapMedicationToResponse(medication: Medication): MedicationResponse {
    return {
      id: medication.id,
      brandName: medication.brandName,
      genericName: medication.genericName,
      labelerName: medication.labelerName,
      activeIngredients: medication.activeIngredients,
      route: medication.routes[0] || '',
      packaging: medication.packaging.map(p => p.description)
    };
  }

  /**
   * Maps paginated result to response format
   * @param result Service result
   * @returns Formatted response
   */
  private formatResponse(result: {
    medications: Medication[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  }): PaginatedMedicationResponse {
    return {
      medications: result.medications.map(this.mapMedicationToResponse),
      total: result.total,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasMore: result.hasMore
    };
  }

  /**
   * Execute the get medication list use case
   * @param filters Medication filters and pagination options
   * @returns Paginated list of medications
   * @throws Error if fetching fails
   */
  async execute(filters: MedicationFilter): Promise<PaginatedMedicationResponse> {

    let result;

    if (filters.activeIngredient && filters.route) {
      result = await this.medicationService.searchByIngredientAndRoute(
        filters.activeIngredient,
        filters.route,
        filters.page,
        filters.limit
      );
    } else if (filters.activeIngredient) {
      result = await this.medicationService.searchByActiveIngredient(
        filters.activeIngredient,
        filters.page,
        filters.limit
      );
    } else if (filters.route) {
      result = await this.medicationService.filterByRoute(
        filters.route,
        filters.page,
        filters.limit
      );
    } else {
      result = await this.medicationService.getMedications(filters)
        .catch((error: Error) => {
          throw new Error(`Failed to fetch medications: ${error.message}`);
        });
    }

    return this.formatResponse(result);
  }
}
