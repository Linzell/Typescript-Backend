// src/domain/services/AuthService.ts
import bcrypt from 'bcryptjs';

import { User } from '../entities/User';
import { IUserRepository } from '../repositories/IUserRepository';
import { AuthError } from '../errors/AuthError';

/** Credentials required for user login */
export type LoginCredentials = {
  email: string;
  password: string;
};

/** Data required for user registration */
export type RegisterData = {
  email: string;
  password: string;
  name: string;
};

/**
 * Service handling authentication and user management
 */
export class AuthService {
  /**
   * Creates an instance of AuthService
   * @param userRepository - Repository for user data access
   */
  constructor(
    private readonly userRepository: IUserRepository
  ) { }

  /**
   * Authenticates a user with their credentials
   * @param credentials - User login credentials
   * @throws {AuthError} When credentials are invalid
   * @returns {Promise<User>} Authenticated user
   */
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

  /**
   * Registers a new user
   * @param userData - User registration data
   * @throws {AuthError} When email is already registered
   * @returns {Promise<User>} Newly created user
   */
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
