// src/infrastructure/auth/types/auth.test.ts
import { describe, expect, test } from 'bun:test';
import { JWTPayload, AuthContext } from './auth';

// Create a minimal mock for testing
const createMockCookie = (initialValue: string) => ({
  value: initialValue,
  get: () => initialValue,
  set: (_value: any) => { },
  remove: () => { },
  update: (_value: any) => { },
  toString: () => `auth=${initialValue}`,
  httpOnly: true,
  secure: true,
});

describe('Auth Types', () => {
  test('JWTPayload should have correct structure', () => {
    const payload: JWTPayload = {
      userId: '123',
      email: 'test@example.com',
      roles: ['user'],
      exp: Date.now(),
      iat: Date.now()
    };

    expect(payload).toHaveProperty('userId');
    expect(payload).toHaveProperty('email');
    expect(payload).toHaveProperty('roles');
    expect(Array.isArray(payload.roles)).toBe(true);
  });

  test('AuthContext JWT functionality', async () => {
    const mockAuthContext: AuthContext = {
      jwt: {
        sign: async (_payload: JWTPayload) => 'mock.token',
        verify: async (_token: string) => ({
          userId: '123',
          email: 'test@example.com',
          roles: ['user']
        })
      },
      cookie: {
        auth: createMockCookie('test-value') as any
      }
    };

    // Test JWT sign
    const token = await mockAuthContext.jwt.sign({
      userId: '123',
      email: 'test@example.com',
      roles: ['user']
    });
    expect(token).toBe('mock.token');

    // Test JWT verify
    const verified = await mockAuthContext.jwt.verify('mock.token');
    expect(verified).toEqual({
      userId: '123',
      email: 'test@example.com',
      roles: ['user']
    });
  });

  test('AuthContext cookie functionality', () => {
    const mockAuthContext: AuthContext = {
      jwt: {
        sign: async (_payload: JWTPayload) => 'mock.token',
        verify: async (_token: string) => null
      },
      cookie: {
        auth: createMockCookie('test-value') as any
      }
    };

    const { auth } = mockAuthContext.cookie;
    expect(auth.value).toBe('test-value');
    expect(auth.httpOnly).toBe(true);
    expect(auth.secure).toBe(true);
  });
});
