// src/domain/types/jwt.ts
export interface DecodedToken {
  userId?: string;
  email?: string;
  exp?: number;
  iat?: number;
}
