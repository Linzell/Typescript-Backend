// src/domain/types/jwt.ts

/**
 * Interface representing a decoded JWT token structure
 * @interface DecodedToken
 * @property {string} [userId] - The unique identifier of the user
 * @property {string} [email] - The email address of the user
 * @property {number} [exp] - The expiration timestamp of the token
 * @property {number} [iat] - The issued at timestamp of the token
 */
export interface DecodedToken {
  userId?: string;
  email?: string;
  exp?: number;
  iat?: number;
}
