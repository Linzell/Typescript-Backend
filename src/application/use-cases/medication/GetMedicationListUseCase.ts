/**
 * @fileoverview Use case for retrieving paginated list of medications with optional filtering
 * @module application/use-cases/medication/GetMedicationListUseCase
 */

import { MedicationService } from '@/domain/services/MedicationService';
import { MedicationFilter, PaginatedMedicationResponse, MedicationResponse } from '@/application/dtos/MedicationDTO';
import { Medication } from '@/domain/entities/Medication';

/**
 * Use case class for getting paginated medication list with filtering capabilities
 */
export class GetMedicationListUseCase {
  /**
   * Creates a new GetMedicationListUseCase instance
   * @param medicationService - The medication service dependency
   */
  constructor(private readonly medicationService: MedicationService) { }

  /**
   * Maps a Medication entity to MedicationResponse DTO
   * @param medication - Medication entity to be mapped
   * @returns MedicationResponse DTO with mapped medication data
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
   * @param result - Raw paginated result from service
   * @param result.medications - Array of medication entities
   * @param result.total - Total number of medications
   * @param result.currentPage - Current page number
   * @param result.totalPages - Total number of pages
   * @param result.hasMore - Whether there are more pages
   * @returns Formatted paginated response
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
   * @param filters - Filter and pagination options
   * @param filters.activeIngredient - Active ingredient to filter by
   * @param filters.route - Administration route to filter by
   * @param filters.page - Page number for pagination
   * @param filters.limit - Number of items per page
   * @returns Promise resolving to paginated medication list
   * @throws Error if medication fetching fails
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
