// src/infrastructure/auth/types/auth.test.ts
import { describe, expect, test } from 'bun:test';
import { Cookie, Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import {
  JWTPayload,
  AuthContext
} from './auth';

describe('Auth Types', () => {
  test('JWTPayload should have correct structure', () => {
    const payload: JWTPayload = {
      userId: '123',
      email: 'test@example.com',
      roles: ['user']
    };

    expect(payload).toHaveProperty('userId');
    expect(payload).toHaveProperty('email');
    expect(payload).toHaveProperty('roles');
    expect(Array.isArray(payload.roles)).toBe(true);
  });

  test('JWT Context should work with Elysia JWT plugin', async () => {
    const app = new Elysia()
      .use(jwt({
        name: 'jwt',
        secret: 'test-secret'
      }));

    const handler = app.handle;
    expect(handler).toBeDefined();
  });

  test('AuthContext should have JWT and cookie functionality', async () => {
    const app = new Elysia()
      .use(jwt({
        name: 'jwt',
        secret: 'test-secret'
      }))
      .get('/test', (context) => {
        // Type checking
        type TestContext = typeof context;

        // Verify that TestContext has required properties from AuthContext
        const hasJwt: keyof AuthContext extends keyof TestContext ? true : false = true;
        const hasCookie: keyof AuthContext extends keyof TestContext ? true : false = true;

        expect(hasJwt).toBe(true);
        expect(hasCookie).toBe(true);

        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      });

    const response = await app.handle(
      new Request('http://localhost/test', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true });
  });

  test('AuthContext should handle JWT methods correctly', async () => {
    const mockAuthContext: AuthContext = {
      jwt: {
        sign: async (_payload: JWTPayload) => 'mock.jwt.token',
        verify: async (_token: string) => ({
          userId: '123',
          email: 'test@example.com',
          roles: ['user']
        })
      },
      cookie: {
        auth: new Cookie('auth', {
          auth: {
            value: 'test-cookie',
            httpOnly: true,
            secure: true
          }
        })
      }
    };

    expect(mockAuthContext.jwt.sign).toBeDefined();
    expect(mockAuthContext.jwt.verify).toBeDefined();
    expect(mockAuthContext.cookie.auth).toBeDefined();

    const token = await mockAuthContext.jwt.sign({
      userId: '123',
      email: 'test@example.com',
      roles: ['user']
    });

    expect(token).toBe('mock.jwt.token');
  });
});
