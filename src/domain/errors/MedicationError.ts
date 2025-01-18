// src/domain/errors/MedicationError.ts

/**
 * Custom error class for medication-related errors
 * @class MedicationError
 * @extends {Error}
 */
export class MedicationError extends Error {
  /**
   * Creates a new MedicationError instance
   * @param {string} message - The error message
   * @param {'NOT_FOUND' | 'INVALID_FILTER' | 'FETCH_ERROR'} code - The error code
   * @param {number} statusCode - The HTTP status code (defaults to 404)
   */
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'INVALID_FILTER' | 'FETCH_ERROR',
    public readonly statusCode: number = 404
  ) {
    super(message);
    this.name = 'MedicationError';
  }
}
