// src/domain/types/medication.test.ts
import { describe, expect, it } from "bun:test";
import { MedicationSchema, MedicationListResponseSchema } from './medication';

describe('Medication Schemas', () => {
  describe('MedicationSchema', () => {
    it('should validate a correct medication object', () => {
      const validMedication = {
        id: "123",
        name: "Advil",
        genericName: "Ibuprofen",
        manufacturer: "Pfizer",
        activeIngredients: [
          {
            name: "Ibuprofen",
            strength: "200mg"
          }
        ],
        route: ["ORAL"],
        packaging: [
          {
            description: "30 tablets bottle",
            marketingStartDate: "2020-01-01",
            isSample: false
          }
        ]
      };

      const result = MedicationSchema.safeParse(validMedication);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid medication object', () => {
      const invalidMedication = {
        id: "123",
        // missing required fields
        name: "Advil",
        manufacturer: "Pfizer"
      };

      const result = MedicationSchema.safeParse(invalidMedication);
      expect(result.success).toBe(false);
    });

    it('should validate active ingredients properly', () => {
      const medicationWithInvalidIngredient = {
        id: "123",
        name: "Advil",
        genericName: "Ibuprofen",
        manufacturer: "Pfizer",
        activeIngredients: [
          {
            name: "Ibuprofen",
            // missing strength
          }
        ],
        route: ["ORAL"],
        packaging: []
      };

      const result = MedicationSchema.safeParse(medicationWithInvalidIngredient);
      expect(result.success).toBe(false);
    });
  });

  describe('MedicationListResponseSchema', () => {
    it('should validate a correct medication list response', () => {
      const validResponse = {
        medications: [
          {
            id: "123",
            name: "Advil",
            genericName: "Ibuprofen",
            manufacturer: "Pfizer",
            activeIngredients: [
              {
                name: "Ibuprofen",
                strength: "200mg"
              }
            ],
            route: ["ORAL"],
            packaging: [
              {
                description: "30 tablets bottle",
                marketingStartDate: "2020-01-01",
                isSample: false
              }
            ]
          }
        ],
        total: 100,
        currentPage: 1,
        totalPages: 10,
        hasMore: true
      };

      const result = MedicationListResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid medication list response', () => {
      const invalidResponse = {
        medications: [], // empty array is valid
        // missing required fields
        currentPage: 1
      };

      const result = MedicationListResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should validate pagination properties', () => {
      const responseWithInvalidPagination = {
        medications: [],
        total: "100", // should be number
        currentPage: 1,
        totalPages: 10,
        hasMore: true
      };

      const result = MedicationListResponseSchema.safeParse(responseWithInvalidPagination);
      expect(result.success).toBe(false);
    });

    it('should ensure medications array contains valid medication objects', () => {
      const responseWithInvalidMedication = {
        medications: [
          {
            id: "123",
            name: "Advil",
            // missing required fields
          }
        ],
        total: 100,
        currentPage: 1,
        totalPages: 10,
        hasMore: true
      };

      const result = MedicationListResponseSchema.safeParse(responseWithInvalidMedication);
      expect(result.success).toBe(false);
    });
  });
});
