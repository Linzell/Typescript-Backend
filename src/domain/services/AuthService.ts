// src/domain/services/AuthService.ts
import bcrypt from 'bcrypt';

import { User } from '../entities/User';
import { IUserRepository } from '../repositories/IUserRepository';
import { AuthError } from '../errors/AuthError';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  name: string;
};

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository
  ) { }

  async authenticate(credentials: LoginCredentials): Promise<User> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.hashedPassword);
    if (!isValidPassword) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    return user;
  }

  async register(userData: RegisterData): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AuthError('Email already registered', 'EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = User.create({
      email: userData.email,
      hashedPassword,
      name: userData.name,
    });

    return this.userRepository.create(user);
  }
}
