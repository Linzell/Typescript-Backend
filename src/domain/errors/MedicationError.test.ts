// src/domain/errors/MedicationError.test.ts
import { describe, expect, it } from "bun:test";
import { MedicationError } from "./MedicationError";

describe("MedicationError", () => {
  it("should create an error with not found status", () => {
    const error = new MedicationError(
      "Medication not found",
      "NOT_FOUND"
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MedicationError);
    expect(error.message).toBe("Medication not found");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("MedicationError");
  });

  it("should create an error with invalid filter", () => {
    const error = new MedicationError(
      "Invalid filter parameters",
      "INVALID_FILTER"
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MedicationError);
    expect(error.message).toBe("Invalid filter parameters");
    expect(error.code).toBe("INVALID_FILTER");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("MedicationError");
  });

  it("should create an error with fetch error", () => {
    const error = new MedicationError(
      "Error fetching medication data",
      "FETCH_ERROR"
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MedicationError);
    expect(error.message).toBe("Error fetching medication data");
    expect(error.code).toBe("FETCH_ERROR");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("MedicationError");
  });

  it("should allow custom status code", () => {
    const error = new MedicationError(
      "Custom medication error",
      "FETCH_ERROR",
      500
    );

    expect(error.statusCode).toBe(500);
  });
});
