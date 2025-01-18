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
      brandName: medication.brandName || '',
      genericName: medication.genericName,
      labelerName: medication.labelerName,
      activeIngredients: medication.activeIngredients,
      route: medication.routes ? medication.routes[0] || '' : '',
      packaging: medication.packaging?.map(p => p.description) || []
    };
  }

  /**
   * Retrieves a paginated list of medications
   */
  async getMedications(filters: MedicationFilter): Promise<PaginatedMedicationResponse | { error: string }> {
    const validatedFilters = MedicationFilterDTO.parse(filters);

    if (validatedFilters.route === 'ALL') {
      delete validatedFilters.route;
    }

    return this.medicationService.getMedications(validatedFilters)
      .then(result => ({
        medications: result.medications?.map(med => this.mapMedicationToResponse(med)) || [],
        total: result.total || 0,
        currentPage: validatedFilters.page,
        totalPages: Math.ceil((result.total || 0) / validatedFilters.limit),
        hasMore: (result.total || 0) > validatedFilters.page * validatedFilters.limit
      }))
      .catch(error => {
        if (error instanceof Error && error.message.includes('Not Found')) {
          return {
            medications: [],
            total: 0,
            currentPage: filters.page,
            totalPages: 0,
            hasMore: false
          };
        }
        return { error: `Failed to fetch medications: ${error instanceof Error ? error.message : 'Unknown error'}` };
      });
  }

  /**
   * Retrieves a single medication by ID
   */
  async getMedicationById(id: string): Promise<MedicationResponse | { error: string }> {
    return this.medicationService.getMedicationById(id)
      .then(medication => {
        if (!medication) {
          return { error: 'Medication not found' };
        }
        return this.mapMedicationToResponse(medication);
      })
      .catch(error => ({
        error: `Failed to fetch medication: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
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
  ): Promise<PaginatedMedicationResponse | { error: string }> {
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
  ): Promise<PaginatedMedicationResponse | { error: string }> {
    const query: MedicationFilter = {
      page,
      limit,
      route
    };

    return this.getMedications(query);
  }

  /**
   * Filters medications by name (brand name or generic name)
   * @param name - Name to search for
   * @param page - Page number
   * @param limit - Items per page
   */
  async filterByName(
    name: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedMedicationResponse | { error: string }> {
    const query: MedicationFilter = {
      page,
      limit,
      name
    };

    return this.getMedications(query);
  }
}
