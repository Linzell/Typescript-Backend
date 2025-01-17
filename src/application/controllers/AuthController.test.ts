// src/application/controllers/AuthController.test.ts
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { AuthController } from './AuthController';
import { AuthService } from '@/domain/services/AuthService';
import { LoginRequest, RegisterRequest, UserResponse } from '../dtos/AuthDTO';

// Create a mock implementation of AuthService
class MockAuthService implements Partial<AuthService> {
  authenticate = mock(() => Promise.resolve({
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    hashedPassword: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  register = mock(() => Promise.resolve({
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    hashedPassword: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: MockAuthService;

  const mockUserResponse: UserResponse = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  };

  beforeEach(() => {
    mockAuthService = new MockAuthService();
    // @ts-ignore - Partial implementation for testing
    authController = new AuthController(mockAuthService);
  });

  describe('login', () => {
    const validCredentials: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login with valid credentials', async () => {
      const result = await authController.login(validCredentials);
      expect(result).toEqual(mockUserResponse);
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(validCredentials);
    });

    it('should throw error with invalid credentials', async () => {
      mockAuthService.authenticate = mock(() =>
        Promise.reject(new Error('Invalid credentials'))
      );

      expect(authController.login(validCredentials))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    const validRegisterData: RegisterRequest = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'Test User'
    };

    it('should successfully register new user', async () => {
      const result = await authController.register(validRegisterData);
      expect(result).toEqual(mockUserResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(validRegisterData);
    });

    it('should throw error when registration fails', async () => {
      mockAuthService.register = mock(() =>
        Promise.reject(new Error('Email already exists'))
      );

      expect(authController.register(validRegisterData))
        .rejects
        .toThrow('Email already exists');
    });
  });
});
