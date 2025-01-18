// src/domain/entities/Medication.test.ts

import { describe, expect, it } from "bun:test";
import { Medication, ActiveIngredient, Packaging } from "./Medication";

describe("Medication", () => {
  // Test data setup
  const mockActiveIngredient: ActiveIngredient = {
    name: "Ibuprofen",
    strength: "200mg"
  };

  const mockPackaging: Packaging = {
    description: "30 tablets in a bottle",
    marketingStartDate: "2023-01-01"
  };

  const mockMedicationData = {
    id: "123",
    brandName: "Advil",
    genericName: "Ibuprofen",
    labelerName: "Pfizer",
    activeIngredients: [mockActiveIngredient],
    routes: ["ORAL"],
    packaging: [mockPackaging]
  };

  describe("constructor", () => {
    it("should create a valid Medication instance with all properties", () => {
      const medication = new Medication(
        mockMedicationData.id,
        mockMedicationData.brandName,
        mockMedicationData.genericName,
        mockMedicationData.labelerName,
        mockMedicationData.activeIngredients,
        mockMedicationData.routes,
        mockMedicationData.packaging
      );

      expect(medication).toBeInstanceOf(Medication);
      expect(medication.id).toBe(mockMedicationData.id);
      expect(medication.brandName).toBe(mockMedicationData.brandName);
      expect(medication.genericName).toBe(mockMedicationData.genericName);
      expect(medication.labelerName).toBe(mockMedicationData.labelerName);
      expect(medication.activeIngredients).toEqual(mockMedicationData.activeIngredients);
      expect(medication.routes).toEqual(mockMedicationData.routes);
      expect(medication.packaging).toEqual(mockMedicationData.packaging);
    });
  });

  describe("ActiveIngredient interface", () => {
    it("should properly structure active ingredient data", () => {
      const ingredient: ActiveIngredient = {
        name: "Paracetamol",
        strength: "500mg"
      };

      expect(ingredient.name).toBe("Paracetamol");
      expect(ingredient.strength).toBe("500mg");
    });
  });

  describe("Packaging interface", () => {
    it("should properly structure packaging data", () => {
      const packaging: Packaging = {
        description: "Blister pack of 10 tablets",
        marketingStartDate: "2023-06-15"
      };

      expect(packaging.description).toBe("Blister pack of 10 tablets");
      expect(packaging.marketingStartDate).toBe("2023-06-15");
    });
  });

  describe("Medication with multiple active ingredients", () => {
    it("should handle multiple active ingredients correctly", () => {
      const multiIngredientMed = new Medication(
        "456",
        "ComboMed",
        "Paracetamol/Caffeine",
        "PharmaCorp",
        [
          { name: "Paracetamol", strength: "500mg" },
          { name: "Caffeine", strength: "65mg" }
        ],
        ["ORAL"],
        [mockPackaging]
      );

      expect(multiIngredientMed.activeIngredients).toHaveLength(2);
      expect(multiIngredientMed.activeIngredients[0].name).toBe("Paracetamol");
      expect(multiIngredientMed.activeIngredients[1].name).toBe("Caffeine");
    });
  });

  describe("Medication with multiple routes", () => {
    it("should handle multiple administration routes correctly", () => {
      const multiRouteMed = new Medication(
        "789",
        "FlexMed",
        "Fleximed",
        "MediCorp",
        [mockActiveIngredient],
        ["ORAL", "TOPICAL", "NASAL"],
        [mockPackaging]
      );

      expect(multiRouteMed.routes).toHaveLength(3);
      expect(multiRouteMed.routes).toContain("ORAL");
      expect(multiRouteMed.routes).toContain("TOPICAL");
      expect(multiRouteMed.routes).toContain("NASAL");
    });
  });

  describe("Medication with multiple packaging options", () => {
    it("should handle multiple packaging options correctly", () => {
      const multiPackagingMed = new Medication(
        "101",
        "MultiPack",
        "Generic Multi",
        "PackCorp",
        [mockActiveIngredient],
        ["ORAL"],
        [
          { description: "30 tablets bottle", marketingStartDate: "2023-01-01" },
          { description: "90 tablets bottle", marketingStartDate: "2023-01-01" },
          { description: "5 tablets sample", marketingStartDate: "2023-01-01" }
        ]
      );

      expect(multiPackagingMed.packaging).toHaveLength(3);
      expect(multiPackagingMed.packaging[0].description).toBe("30 tablets bottle");
      expect(multiPackagingMed.packaging[1].description).toBe("90 tablets bottle");
    });
  });
});
