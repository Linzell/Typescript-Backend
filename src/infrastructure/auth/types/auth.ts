// src/infrastructure/auth/types/auth.ts
import { Cookie } from 'elysia';

/**
 * JWT Payload interface defining the structure of the JWT token payload
 * @interface JWTPayload
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
 */
export interface AuthContext {
  jwt: {
    /**
     * Signs a JWT payload and returns a token
     * @param payload - The payload to sign
     * @returns Promise<string> - The signed JWT token
     */
    sign: (payload: JWTPayload) => Promise<string>;

    /**
     * Verifies a JWT token and returns the payload
     * @param token - The token to verify
     * @returns Promise<JWTPayload | null> - The verified payload or null if invalid
     */
    verify: (token: string) => Promise<JWTPayload | null>;
  };
  cookie: {
    /**
     * Authentication cookie
     */
    auth: Cookie<string>;
  };
}
