// src/domain/services/MedicationService.ts
import { Medication } from '@/domain/entities/Medication';
import { IMedicationRepository, MedicationFilters } from '@/domain/repositories/IMedicationRepository';

/**
 * Service responsible for medication-related business logic
 */
export class MedicationService {
  constructor(private readonly medicationRepository: IMedicationRepository) { }

  /**
   * Retrieves a paginated list of medications with optional filters
   * @param filters - Object containing pagination and filter parameters
   * @returns Promise with medications and total count
   */
  async getMedications(filters: MedicationFilters): Promise<{
    medications: Medication[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    return this.medicationRepository.findMedications(filters)
      .then(({ medications, total }) => {
        const totalPages = Math.ceil(total / filters.limit);
        const hasMore = filters.page < totalPages;

        return {
          medications,
          total,
          currentPage: filters.page,
          totalPages,
          hasMore
        };
      })
      .catch((error: unknown) => {
        throw new MedicationError(
          `Failed to fetch medications: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'FETCH_ERROR'
        );
      });
  }

  /**
   * Retrieves a single medication by its ID
   * @param id - Medication ID
   * @returns Promise with the medication or null if not found
   */
  async getMedicationById(id: string): Promise<Medication | null> {
    return this.medicationRepository.findById(id)
      .then(medication => medication)
      .catch((error: unknown) => {
        throw new MedicationError(
          `Failed to fetch medication with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'FETCH_ERROR'
        );
      });
  }

  /**
   * Searches medications by active ingredient
   * @param ingredient - Active ingredient name
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with filtered medications and total count
   */
  searchByActiveIngredient(ingredient: string, page: number = 1, limit: number = 10) {
    return this.getMedications({
      activeIngredient: ingredient,
      page,
      limit
    });
  }

  /**
   * Filters medications by administration route
   * @param route - Administration route
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with filtered medications and total count
   */
  filterByRoute(route: string, page: number = 1, limit: number = 10) {
    return this.getMedications({
      route,
      page,
      limit
    });
  }

  /**
   * Searches medications by both active ingredient and route
   * @param ingredient - Active ingredient name
   * @param route - Administration route
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with filtered medications and total count
   */
  searchByIngredientAndRoute(
    ingredient: string,
    route: string,
    page: number = 1,
    limit: number = 10
  ) {
    return this.getMedications({
      activeIngredient: ingredient,
      route,
      page,
      limit
    });
  }
  /**
   * Filters medications by name (brand name or generic name)
   * @param name - Name to search for
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise with filtered medications and total count
   */
  filterByName(name: string, page: number = 1, limit: number = 10) {
    return this.getMedications({
      name,
      page,
      limit
    });
  }
}

export class MedicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'MedicationError';
  }
}
