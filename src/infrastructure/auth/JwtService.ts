// src/infrastructure/auth/JwtService.ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

export const createJwtPlugin = (secret: string) => {
  return new Elysia()
    .use(
      jwt({
        name: 'jwt',
        secret,
      })
    );
};
