// src/domain/errors/AuthError.ts
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_CREDENTIALS' | 'EMAIL_EXISTS' | 'INVALID_TOKEN',
    public readonly statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
