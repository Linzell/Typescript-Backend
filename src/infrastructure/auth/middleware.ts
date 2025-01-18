// src/infrastructure/auth/middleware.ts
import type { Elysia } from 'elysia';
import { JWTPayload } from './types/auth';
import { jwt } from '@elysiajs/jwt';
import { config } from '@/config';

/**
 * Creates an authentication middleware for Elysia application
 * @param app - The Elysia application instance
 * @returns Authentication middleware with JWT verification
 */
export const createAuthMiddleware = (app: Elysia) => {
  const middleware = app
    .use(jwt({
      name: 'jwt',
      secret: config.JWT_ACCESS_SECRET,
      exp: '24h'
    }))
    .derive(async ({ jwt, cookie: { auth }, set }) => {
      if (!auth.value) {
        set.status = 401;
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        };
      }

      try {
        const payload = await jwt.verify(auth.value);

        if (!payload || !isValidPayload(payload)) {
          set.status = 401;
          auth.remove();
          return {
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired token'
            }
          };
        }

        return {
          success: true,
          user: payload as JWTPayload
        };

      } catch (error) {
        set.status = 401;
        auth.remove();
        return {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    });

  return middleware;
};

/**
 * Type guard to validate JWT payload structure
 * @param payload - The payload to validate
 * @returns Boolean indicating if the payload matches JWTPayload structure
 */
function isValidPayload(payload: any): payload is JWTPayload {
  return (
    typeof payload === 'object' &&
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    Array.isArray(payload.roles)
  );
}
