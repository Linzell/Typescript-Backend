// src/application/dtos/MedicationDTO.test.ts
import { expect, describe, test } from "bun:test";
import {
  MedicationFilterDTO,
  ActiveIngredientDTO,
  MedicationResponseDTO,
  PaginatedMedicationResponseDTO
} from "./MedicationDTO";

describe("MedicationFilterDTO", () => {
  test("should validate valid filter data", () => {
    const validFilter = {
      page: 1,
      limit: 10,
      activeIngredient: "Ibuprofen",
      route: "ORAL"
    };

    const result = MedicationFilterDTO.safeParse(validFilter);
    expect(result.success).toBe(true);
  });

  test("should validate filter data without optional fields", () => {
    const validFilter = {
      page: 1,
      limit: 10
    };

    const result = MedicationFilterDTO.safeParse(validFilter);
    expect(result.success).toBe(true);
  });

  test("should reject invalid page number", () => {
    const invalidFilter = {
      page: 0,  // Invalid: page must be >= 1
      limit: 10
    };

    const result = MedicationFilterDTO.safeParse(invalidFilter);
    expect(result.success).toBe(false);
  });

  test("should reject invalid limit", () => {
    const invalidFilter = {
      page: 1,
      limit: 101  // Invalid: limit must be <= 100
    };

    const result = MedicationFilterDTO.safeParse(invalidFilter);
    expect(result.success).toBe(false);
  });
});

describe("ActiveIngredientDTO", () => {
  test("should validate valid active ingredient", () => {
    const validIngredient = {
      name: "Ibuprofen",
      strength: "200mg"
    };

    const result = ActiveIngredientDTO.safeParse(validIngredient);
    expect(result.success).toBe(true);
  });

  test("should reject missing fields", () => {
    const invalidIngredient = {
      name: "Ibuprofen"
      // Missing strength field
    };

    const result = ActiveIngredientDTO.safeParse(invalidIngredient);
    expect(result.success).toBe(false);
  });
});

describe("MedicationResponseDTO", () => {
  test("should validate valid medication response", () => {
    const validMedication = {
      id: "123",
      brandName: "Advil",
      genericName: "Ibuprofen",
      labelerName: "Pfizer",
      activeIngredients: [
        { name: "Ibuprofen", strength: "200mg" }
      ],
      route: "ORAL",
      packaging: ["30 tablets in 1 bottle", "90 tablets in 1 bottle"]
    };

    const result = MedicationResponseDTO.safeParse(validMedication);
    expect(result.success).toBe(true);
  });

  test("should reject invalid medication response", () => {
    const invalidMedication = {
      id: "123",
      brandName: "Advil",
      // Missing required fields
      activeIngredients: [
        { name: "Ibuprofen", strength: "200mg" }
      ],
      route: "ORAL",
      packaging: ["30 tablets in 1 bottle"]
    };

    const result = MedicationResponseDTO.safeParse(invalidMedication);
    expect(result.success).toBe(false);
  });
});

describe("PaginatedMedicationResponseDTO", () => {
  test("should validate valid paginated response", () => {
    const validPaginatedResponse = {
      medications: [{
        id: "123",
        brandName: "Advil",
        genericName: "Ibuprofen",
        labelerName: "Pfizer",
        activeIngredients: [
          { name: "Ibuprofen", strength: "200mg" }
        ],
        route: "ORAL",
        packaging: ["30 tablets in 1 bottle"]
      }],
      total: 100,
      currentPage: 1,
      totalPages: 10,
      hasMore: true
    };

    const result = PaginatedMedicationResponseDTO.safeParse(validPaginatedResponse);
    expect(result.success).toBe(true);
  });

  test("should reject invalid paginated response", () => {
    const invalidPaginatedResponse = {
      medications: [],
      total: "100",  // Invalid: should be number
      currentPage: 1,
      totalPages: 10,
      hasMore: true
    };

    const result = PaginatedMedicationResponseDTO.safeParse(invalidPaginatedResponse);
    expect(result.success).toBe(false);
  });

  test("should validate empty medications array", () => {
    const emptyResponse = {
      medications: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
      hasMore: false
    };

    const result = PaginatedMedicationResponseDTO.safeParse(emptyResponse);
    expect(result.success).toBe(true);
  });
});
