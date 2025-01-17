// src/domain/services/AuthService.test.ts
import { expect, test, mock, beforeEach, describe } from "bun:test";
import { AuthService, LoginCredentials, RegisterData } from "./AuthService";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { User } from "@/domain/entities/User";
import { AuthError } from "@/domain/errors/AuthError";

import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: IUserRepository;

  const mockUser = User.create({
    email: 'test@example.com',
    hashedPassword: 'hashed_password',
    name: 'Test User',
  });

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: mock(() => Promise.resolve(null)),
      findById: mock(() => Promise.resolve(null)),
      create: mock((user: User) => Promise.resolve(user)),
      update: mock((_id: string, _data: Partial<User>) => Promise.resolve(mockUser)),
    };

    authService = new AuthService(mockUserRepository);
  });

  test('authenticate - successful login', async () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockUserRepository.findByEmail = mock(() => Promise.resolve(mockUser));
    bcrypt.compare = mock(() => Promise.resolve(true));

    const result = await authService.authenticate(credentials);

    expect(result).toEqual(mockUser);
  });

  test('authenticate - invalid credentials', async () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'wrong_password',
    };

    mockUserRepository.findByEmail = mock(() => Promise.resolve(null));

    expect(authService.authenticate(credentials)).rejects.toThrow(AuthError);
  });

  test('register - successful registration', async () => {
    const registerData: RegisterData = {
      email: 'newuser@example.com',
      password: 'newpassword123',
      name: 'New User',
    };

    mockUserRepository.findByEmail = mock(() => Promise.resolve(null));
    mockUserRepository.create = mock(() => Promise.resolve(mockUser));

    const result = await authService.register(registerData);

    expect(result).toEqual(mockUser);
  });

  test('register - email already exists', async () => {
    const registerData: RegisterData = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User',
    };

    mockUserRepository.findByEmail = mock(() => Promise.resolve(mockUser));

    expect(authService.register(registerData)).rejects.toThrow(AuthError);
  });
});
