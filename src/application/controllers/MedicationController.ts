// src/application/controllers/MedicationController.ts
import { MedicationService } from '@/domain/services/MedicationService';
import {
  MedicationFilter,
  MedicationResponse,
  PaginatedMedicationResponse,
  MedicationFilterDTO,
} from '../dtos/MedicationDTO';
import { Medication } from '@/domain/entities/Medication';

export class MedicationController {
  constructor(private readonly medicationService: MedicationService) { }

  /**
   * Maps a Medication entity to MedicationResponse DTO
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
   * Retrieves a paginated list of medications
   */
  async getMedications(filters: MedicationFilter): Promise<PaginatedMedicationResponse> {
    const validatedFilters = MedicationFilterDTO.parse(filters);

    return this.medicationService.getMedications(validatedFilters)
      .then(result => ({
        medications: result.medications.map(med => this.mapMedicationToResponse(med)),
        total: result.total,
        currentPage: validatedFilters.page,
        totalPages: Math.ceil(result.total / validatedFilters.limit),
        hasMore: result.total > validatedFilters.page * validatedFilters.limit
      }))
      .catch(error => {
        throw new Error(`Failed to fetch medications: ${error.message}`);
      });
  }

  /**
   * Retrieves a single medication by ID
   */
  async getMedicationById(id: string): Promise<MedicationResponse> {
    return this.medicationService.getMedicationById(id)
      .then(medication => {
        if (!medication) {
          throw new Error('Medication not found');
        }
        return this.mapMedicationToResponse(medication);
      })
      .catch(error => {
        throw new Error(`Failed to fetch medication: ${error.message}`);
      });
  }

  /**
   * Searches medications by active ingredient
   * @param ingredient - Active ingredient name
   * @param page - Page number
   * @param limit - Items per page
   */
  async searchByActiveIngredient(
    ingredient: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedMedicationResponse> {
    const query: MedicationFilter = {
      page,
      limit,
      activeIngredient: ingredient
    };

    return this.getMedications(query);
  }

  /**
   * Filters medications by administration route
   * @param route - Administration route
   * @param page - Page number
   * @param limit - Items per page
   */
  async filterByRoute(
    route: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedMedicationResponse> {
    const query: MedicationFilter = {
      page,
      limit,
      route
    };

    return this.getMedications(query);
  }
}
