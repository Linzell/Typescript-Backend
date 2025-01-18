// src/domain/errors/AuthError.ts
/**
 * Custom error class for handling authentication-related errors
 * @extends Error
 */
export class AuthError extends Error {
  /**
   * Creates an instance of AuthError
   * @param {string} message - The error message
   * @param {('INVALID_CREDENTIALS'|'EMAIL_EXISTS'|'INVALID_TOKEN')} code - The error code
   * @param {number} statusCode - The HTTP status code (defaults to 401)
   */
  constructor(
    message: string,
    public readonly code: 'INVALID_CREDENTIALS' | 'EMAIL_EXISTS' | 'INVALID_TOKEN',
    public readonly statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
