// src/domain/types/medication.ts
import { z } from 'zod';

/**
 * Zod schema defining the structure and validation rules for a medication object
 * @description Validates and defines the shape of medication data including identifying information,
 * active ingredients, routes of administration and packaging details
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
 * Zod schema for paginated medication list response data
 * @description Defines the structure of paginated API responses containing medication data,
 * including metadata about pagination state
 */
export const MedicationListResponseSchema = z.object({
  medications: z.array(MedicationSchema),
  total: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean()
});

/**
 * Type representing a single medication record
 * @description Inferred TypeScript type from MedicationSchema
 */
export type Medication = z.infer<typeof MedicationSchema>;

/**
 * Type representing a paginated list of medications
 * @description Inferred TypeScript type from MedicationListResponseSchema
 */
export type MedicationListResponse = z.infer<typeof MedicationListResponseSchema>;
