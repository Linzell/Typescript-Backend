// src/domain/errors/MedicationError.ts
export class MedicationError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'INVALID_FILTER' | 'FETCH_ERROR',
    public readonly statusCode: number = 404
  ) {
    super(message);
    this.name = 'MedicationError';
  }
}
