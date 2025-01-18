// src/application/dtos/MedicationDTO.ts
import { z } from 'zod';

/**
 * Data transfer object for medication filter parameters
 * @property {number} page - Current page number (min: 1)
 * @property {number} limit - Number of items per page (min: 1, max: 100)
 * @property {string} activeIngredient - Filter by active ingredient name
 * @property {string} route - Filter by administration route
 * @property {string} name - Filter by medication name
 */
export const MedicationFilterDTO = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  activeIngredient: z.string().optional(),
  route: z.string().optional(),
  name: z.string().optional()
});

/**
 * Data transfer object for active ingredient information
 * @property {string} name - Name of the active ingredient
 * @property {string} strength - Strength/dosage of the active ingredient
 */
export const ActiveIngredientDTO = z.object({
  name: z.string(),
  strength: z.string()
});

/**
 * Data transfer object for medication response data
 * @property {string} id - Unique identifier for the medication
 * @property {string} brandName - Commercial brand name of the medication
 * @property {string} labelerName - Name of the manufacturer/labeler
 * @property {ActiveIngredientDTO[]} activeIngredients - List of active ingredients
 * @property {string} route - Administration route
 * @property {string[]} packaging - Available packaging options
 */
export const MedicationResponseDTO = z.object({
  id: z.string(),
  brandName: z.string().optional().default(''),
  labelerName: z.string(),
  activeIngredients: z.array(ActiveIngredientDTO),
  route: z.string().default(''),
  packaging: z.array(z.string()).default([])
});

/**
 * Data transfer object for paginated medication response
 * @property {MedicationResponseDTO[]} medications - Array of medication items
 * @property {number} total - Total number of medications
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasMore - Indicates if there are more pages
 */
export const PaginatedMedicationResponseDTO = z.object({
  medications: z.array(MedicationResponseDTO),
  total: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean()
});

/**
 * Type definition for medication filter parameters
 */
export type MedicationFilter = z.infer<typeof MedicationFilterDTO>;

/**
 * Type definition for medication response data
 */
export type MedicationResponse = z.infer<typeof MedicationResponseDTO>;

/**
 * Type definition for paginated medication response
 */
export type PaginatedMedicationResponse = z.infer<typeof PaginatedMedicationResponseDTO>;
