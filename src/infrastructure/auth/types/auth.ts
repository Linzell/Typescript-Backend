// src/infrastructure/auth/types/auth.ts
import { Cookie } from 'elysia';

/**
 * JWT Payload interface defining the structure of the JWT token payload
 * @interface JWTPayload
 * @property {string} userId - Unique identifier of the user
 * @property {string} email - Email address of the user
 * @property {string[]} roles - Array of roles assigned to the user
 * @property {number} [exp] - Optional expiration timestamp
 * @property {number} [iat] - Optional issued at timestamp
 */
export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  exp?: number;
  iat?: number;
}

/**
 * Authentication context interface providing JWT and cookie functionality
 * @interface AuthContext
 * @property {Object} jwt - JWT operations object
 * @property {Object} cookie - Cookie operations object
 */
export interface AuthContext {
  jwt: {
    /**
     * Signs a JWT payload and returns a token
     * @param {JWTPayload} payload - The payload to sign
     * @returns {Promise<string>} The signed JWT token
     */
    sign: (payload: JWTPayload) => Promise<string>;

    /**
     * Verifies a JWT token and returns the payload
     * @param {string} token - The token to verify
     * @returns {Promise<JWTPayload | null>} The verified payload or null if invalid
     */
    verify: (token: string) => Promise<JWTPayload | null>;
  };
  cookie: {
    /**
     * Authentication cookie
     * @type {Cookie<string>}
     */
    auth: Cookie<string>;
  };
}
