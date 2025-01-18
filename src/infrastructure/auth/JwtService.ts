// src/infrastructure/auth/JwtService.ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

/**
 * Creates a JWT authentication plugin for Elysia
 *
 * @param secret - The secret key used to sign JWTs
 * @returns An Elysia instance configured with JWT authentication
 *
 * @example
 * ```ts
 * const app = new Elysia()
 * app.use(createJwtPlugin('your-secret-key'))
 * ```
 */
export const createJwtPlugin = (secret: string) => {
  return new Elysia()
    .use(
      jwt({
        name: 'jwt',
        secret,
      })
    );
};
