// src/infrastructure/auth/types/auth.ts
import { Cookie } from 'elysia';

export type JWTPayload = {
  userId: string;
  email: string;
  roles: string[];
  exp?: number;
  iat?: number;
};

export type AuthContext = {
  jwt: {
    sign: (payload: JWTPayload) => Promise<string>;
    verify: (token: string) => Promise<JWTPayload | null>;
  };
  cookie: {
    auth: Cookie<string>;
  };
};
