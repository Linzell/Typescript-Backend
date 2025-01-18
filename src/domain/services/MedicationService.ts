// src/domain/services/MedicationService.ts
import { Medication } from '@/domain/entities/Medication';
import { IMedicationRepository, MedicationFilters } from '@/domain/repositories/IMedicationRepository';

/**
 * Service responsible for handling medication-related business logic and operations
 * @class MedicationService
 */
export class MedicationService {
  /**
   * Creates an instance of MedicationService
   * @param {IMedicationRepository} medicationRepository - Repository for medication data access
   */
  constructor(private readonly medicationRepository: IMedicationRepository) { }

  /**
   * Retrieves a paginated list of medications with optional filters
   * @param {MedicationFilters} filters - Object containing pagination and filter parameters
   * @returns {Promise<{medications: Medication[], total: number, currentPage: number, totalPages: number, hasMore: boolean}>} Promise with medications data and pagination info
   * @throws {MedicationError} When medications fetch fails
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
   * @param {string} id - Medication ID to lookup
   * @returns {Promise<Medication | null>} Promise with the medication if found, null otherwise
   * @throws {MedicationError} When medication fetch fails
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
   * @param {string} ingredient - Active ingredient name to search for
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [limit=10] - Number of items per page
   * @returns {Promise<{medications: Medication[], total: number, currentPage: number, totalPages: number, hasMore: boolean}>}
   * Promise with filtered medications data and pagination info
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
   * @param {string} route - Administration route to filter by
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [limit=10] - Number of items per page
   * @returns {Promise<{medications: Medication[], total: number, currentPage: number, totalPages: number, hasMore: boolean}>}
   * Promise with filtered medications data and pagination info
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
   * @param {string} ingredient - Active ingredient name to search for
   * @param {string} route - Administration route to filter by
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [limit=10] - Number of items per page
   * @returns {Promise<{medications: Medication[], total: number, currentPage: number, totalPages: number, hasMore: boolean}>}
   * Promise with filtered medications data and pagination info
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
   * @param {string} name - Name to search for
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [limit=10] - Number of items per page
   * @returns {Promise<{medications: Medication[], total: number, currentPage: number, totalPages: number, hasMore: boolean}>}
   * Promise with filtered medications data and pagination info
   */
  filterByName(name: string, page: number = 1, limit: number = 10) {
    return this.getMedications({
      name,
      page,
      limit
    });
  }
}

/**
 * Custom error class for medication-related errors
 * @class MedicationError
 * @extends Error
 */
export class MedicationError extends Error {
  /**
   * Creates an instance of MedicationError
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {number} [statusCode=500] - HTTP status code
   */
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'MedicationError';
  }
}
