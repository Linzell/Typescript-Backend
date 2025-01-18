// src/domain/repositories/IMedicationRepository.ts
import { Medication } from '@/domain/entities/Medication';

/**
 * Interface defining medication filtering and pagination parameters
 * @interface MedicationFilters
 * @property {string} [activeIngredient] - Filter by active ingredient name
 * @property {string} [route] - Filter by administration route
 * @property {number} page - Page number for pagination
 * @property {number} limit - Number of items per page
 * @property {string} [name] - Filter by medication name
 */
export interface MedicationFilters {
  activeIngredient?: string;
  route?: string;
  page: number;
  limit: number;
  name?: string;
}

/**
 * Repository interface for medication data access
 * @interface IMedicationRepository
 */
export interface IMedicationRepository {
  /**
   * Fetches paginated medications with optional filters
   * @param {MedicationFilters} filters - Filtering and pagination parameters
   * @returns {Promise<{medications: Medication[], total: number}>} Promise containing medications array and total count
   * @throws {Error} If the repository operation fails
   */
  findMedications(filters: MedicationFilters): Promise<{
    medications: Medication[];
    total: number;
  }>;

  /**
   * Fetches a single medication by its ID
   * @param {string} id - Medication ID
   * @returns {Promise<Medication | null>} Promise containing the medication or null if not found
   * @throws {Error} If the repository operation fails
   */
  findById(id: string): Promise<Medication | null>;
}
