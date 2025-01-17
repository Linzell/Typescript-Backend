// src/infrastructure/auth/middleware.ts
import { Elysia } from 'elysia';
import { JWTPayload } from './types/auth';

import jwt from '@elysiajs/jwt';
import { config } from '@/config';

export const createAuthMiddleware = (app: Elysia) => {
  return app
    .use(jwt({
      name: 'jwt',
      secret: config.JWT_ACCESS_SECRET,
      exp: '24h'
    })).derive(async ({ jwt, cookie: { auth }, set }) => {
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
};

function isValidPayload(payload: any): payload is JWTPayload {
  return (
    typeof payload === 'object' &&
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    Array.isArray(payload.roles)
  );
}
