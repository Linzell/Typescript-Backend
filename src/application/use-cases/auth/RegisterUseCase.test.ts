// src/application/use-cases/auth/RegisterUseCase.test.ts
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { RegisterUseCase } from './RegisterUseCase';
import { AuthService } from '@/domain/services/AuthService';
import { UserResponse, RegisterRequest } from '@/application/dtos/AuthDTO';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockAuthService: AuthService;

  beforeEach(() => {
    mockAuthService = {
      register: mock(() => Promise.resolve({
        id: '1234',
        email: 'test@example.com',
        name: 'Test User'
      }))
    } as any;

    registerUseCase = new RegisterUseCase(mockAuthService);
  });

  it('should successfully register with valid user data', async () => {
    const userData: RegisterRequest = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User'
    };

    const expectedResponse: UserResponse = {
      id: '1234',
      email: 'test@example.com',
      name: 'Test User'
    };

    const result = await registerUseCase.execute(userData);

    expect(result).toEqual(expectedResponse);
    expect(mockAuthService.register).toHaveBeenCalledWith(userData);
  });

  it('should handle registration failures', async () => {
    mockAuthService.register = mock(() =>
      Promise.reject(new Error('Email already exists'))
    );

    const userData: RegisterRequest = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Test User'
    };

    await expect(registerUseCase.execute(userData))
      .rejects
      .toThrow('Email already exists');
  });
});
