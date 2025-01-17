// src/presentation/routes/authRoutes.test.ts

import { describe, expect, it, beforeEach, mock } from "bun:test";
import { Elysia } from 'elysia';
import { authRoutes } from './authRoutes';
import { config } from '@/config';
import jwt from "@elysiajs/jwt";

describe('authRoutes', () => {
  let app: Elysia;

  beforeEach(() => {
    app = new Elysia()
      .decorate('jwt', {
        sign: mock(() => Promise.resolve('mock.jwt.token'))
      })
      .decorate('cookie', {
        auth: {
          set: mock(() => { }),
          remove: mock(() => { })
        }
      })
      .use(jwt({
        name: 'jwt',
        secret: config.JWT_ACCESS_SECRET
      }));

    // Create a complete mock of AuthController
    const mockAuthController = {
      login: mock(() => Promise.resolve({ id: '123', email: 'test@example.com' })),
      register: mock(() => Promise.resolve({ id: '123', email: 'new@example.com' }))
    };

    // Mock the entire module
    mock.module('@/application/controllers/AuthController', () => ({
      AuthController: class {
        constructor() {
          return mockAuthController;
        }
      }
    }));

    mock.module('@/application/dtos/AuthDTO', () => ({
      LoginRequestDTO: {
        parse: mock((data) => data)
      },
      RegisterRequestDTO: {
        parse: mock((data) => data)
      }
    }));

    authRoutes(app);
  });

  describe('POST /auth/login', () => {
    it('should set auth cookie and return success message on login', async () => {
      const response = await app.handle(new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      }));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ message: 'Login successful' });
    });
  });

  describe('POST /auth/register', () => {
    it('should set auth cookie and return success message on registration', async () => {
      const response = await app.handle(new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'new@example.com', password: 'password', name: 'New User' })
      }));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ message: 'Registration successful' });
    });
  });

  describe('POST /auth/logout', () => {
    it('should remove auth cookie and return success message', async () => {
      const response = await app.handle(new Request('http://localhost/auth/logout', {
        method: 'POST'
      }));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ message: 'Logged out successfully' });
    });
  });
});
