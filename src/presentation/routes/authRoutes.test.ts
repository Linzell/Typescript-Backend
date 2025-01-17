// src/presentation/routes/authRoutes.test.ts
import { describe, expect, it, beforeEach, mock } from "bun:test";
import { authRoutes } from './authRoutes';
import { MockElysia, type IMockElysia } from "./__mocks__/elysia.mock";

// Mocks
const mockAuthController = {
  login: mock(() => Promise.resolve({ id: '123', email: 'test@example.com' })),
  register: mock(() => Promise.resolve({ id: '123', email: 'new@example.com' }))
};

// Setup mocks using Bun's mock
mock.module('@/application/controllers/AuthController', () => ({
  AuthController: class {
    constructor() {
      return mockAuthController;
    }
  }
}));

mock.module('@/application/dtos/AuthDTO', () => ({
  LoginRequestDTO: {
    parse: (data: any) => data
  },
  RegisterRequestDTO: {
    parse: (data: any) => data
  }
}));

// Mock the Elysia module
mock.module('elysia', () => ({
  Elysia: MockElysia
}));

mock.module('@elysiajs/jwt', () => ({
  jwt: () => (app: any) => app
}));

describe('authRoutes', () => {
  let app: IMockElysia;

  beforeEach(() => {
    app = new MockElysia();
    authRoutes(app as any);
  });

  describe('POST /auth/login', () => {
    it('should return success message on login', async () => {
      const response = await app.handle(new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password'
        })
      }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ message: 'Login successful' });
    });

    it('should handle login errors', async () => {
      mockAuthController.login.mock(() => Promise.reject(new Error('Login failed')));

      const response = await app.handle(new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong-password'
        })
      }));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Internal Server Error' });
    });
  });

  describe('POST /auth/register', () => {
    it('should return success message on registration', async () => {
      const response = await app.handle(new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'password',
          name: 'New User'
        })
      }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ message: 'Registration successful' });
    });

    it('should handle registration errors', async () => {
      mockAuthController.register.mock(() => Promise.reject(new Error('Registration failed')));

      const response = await app.handle(new Request('http://localhost/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'password',
          name: 'New User'
        })
      }));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Internal Server Error' });
    });
  });

  describe('POST /auth/logout', () => {
    it('should return success message on logout', async () => {
      const response = await app.handle(new Request('http://localhost/auth/logout', {
        method: 'POST'
      }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ message: 'Logged out successfully' });
    });
  });
});
