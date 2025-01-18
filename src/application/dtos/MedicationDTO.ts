// src/application/dtos/MedicationDTO.ts
import { z } from 'zod';

export const MedicationFilterDTO = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  activeIngredient: z.string().optional(),
  route: z.string().optional()
});

export const ActiveIngredientDTO = z.object({
  name: z.string(),
  strength: z.string()
});

export const MedicationResponseDTO = z.object({
  id: z.string(),
  brandName: z.string().optional().default(''),
  labelerName: z.string(),
  activeIngredients: z.array(ActiveIngredientDTO),
  route: z.string().default(''),
  packaging: z.array(z.string()).default([])
});

export const PaginatedMedicationResponseDTO = z.object({
  medications: z.array(MedicationResponseDTO),
  total: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean()
});

export type MedicationFilter = z.infer<typeof MedicationFilterDTO>;
export type MedicationResponse = z.infer<typeof MedicationResponseDTO>;
export type PaginatedMedicationResponse = z.infer<typeof PaginatedMedicationResponseDTO>;
