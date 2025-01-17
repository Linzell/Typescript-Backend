// src/application/use-cases/auth/LoginUseCase.test.ts
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { LoginUseCase } from './LoginUseCase';
import { AuthService } from '@/domain/services/AuthService';
import { LoginRequest } from '@/application/dtos/AuthDTO';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockAuthService: AuthService;

  beforeEach(() => {
    mockAuthService = {
      authenticate: mock(() => Promise.resolve({
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }))
    } as any;

    loginUseCase = new LoginUseCase(mockAuthService);
  });

  it('should successfully login with valid credentials', async () => {
    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    const result = await loginUseCase.execute(credentials);

    expect(result).toEqual({
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    });
    expect(mockAuthService.authenticate).toHaveBeenCalledWith(credentials);
  });

  it('should handle authentication failures', async () => {
    mockAuthService.authenticate = mock(() =>
      Promise.reject(new Error('Invalid credentials'))
    );

    const credentials: LoginRequest = {
      email: 'test@example.com',
      password: 'wrong-password'
    };

    expect(loginUseCase.execute(credentials))
      .rejects
      .toThrow('Invalid credentials');
  });
});
