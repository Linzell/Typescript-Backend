// src/domain/types/medication.ts
import { z } from 'zod';

/**
 * Schema for a medication object
 * @typedef {Object} MedicationSchema
 * @property {string} id - Unique identifier for the medication
 * @property {string} name - Brand name of the medication
 * @property {string} genericName - Generic/scientific name of the medication
 * @property {string} manufacturer - Name of the manufacturing company
 * @property {Array<Object>} activeIngredients - List of active ingredients
 * @property {string} activeIngredients.name - Name of the active ingredient
 * @property {string} activeIngredients.strength - Strength/dosage of the ingredient
 * @property {Array<string>} route - Administration routes for the medication
 * @property {Array<Object>} packaging - Available packaging options
 * @property {string} packaging.description - Description of the package
 * @property {string} packaging.marketingStartDate - Date when marketing began
 * @property {boolean} packaging.isSample - Whether this is a sample package
 */
export const MedicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  genericName: z.string(),
  manufacturer: z.string(),
  activeIngredients: z.array(z.object({
    name: z.string(),
    strength: z.string()
  })),
  route: z.array(z.string()),
  packaging: z.array(z.object({
    description: z.string(),
    marketingStartDate: z.string(),
    isSample: z.boolean()
  }))
});

/**
 * Schema for paginated medication list response
 * @typedef {Object} MedicationListResponseSchema
 * @property {Array<MedicationSchema>} medications - List of medications
 * @property {number} total - Total number of medications available
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasMore - Whether there are more pages available
 */
export const MedicationListResponseSchema = z.object({
  medications: z.array(MedicationSchema),
  total: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean()
});

export type Medication = z.infer<typeof MedicationSchema>;
export type MedicationListResponse = z.infer<typeof MedicationListResponseSchema>;
