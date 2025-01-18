// src/application/controllers/AuthController.ts
/**
 * Controller responsible for handling authentication related operations
 * @class AuthController
 */
import { LoginRequest, RegisterRequest, UserResponse } from '@/application/dtos/AuthDTO';
import { User } from '@/domain/entities/User';
import { AuthService } from '@/domain/services/AuthService';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';

export class AuthController {
  private authService: AuthService;

  /**
   * Creates an instance of AuthController
   * @param {AuthService} [authService] - Optional AuthService instance for dependency injection
   */
  constructor(authService?: AuthService) {
    if (authService) {
      this.authService = authService;
    } else {
      const userRepository = new PrismaUserRepository();
      this.authService = new AuthService(userRepository);
    }
  }

  /**
   * Handle user login request
   * @param {LoginRequest} credentials - User login credentials
   * @returns {Promise<UserResponse>} Authenticated user data
   * @throws {Error} When authentication fails
   */
  async login(credentials: LoginRequest): Promise<UserResponse> {
    const user = await this.authService.authenticate(credentials);
    return this.mapUserToResponse(user);
  }

  /**
   * Handle user registration request
   * @param {RegisterRequest} userData - User registration data
   * @returns {Promise<UserResponse>} Newly created user data
   * @throws {Error} When registration fails
   */
  async register(userData: RegisterRequest): Promise<UserResponse> {
    const user = await this.authService.register(userData);
    return this.mapUserToResponse(user);
  }

  /**
   * Maps User domain entity to UserResponse DTO
   * @param {User} user - User domain entity
   * @returns {UserResponse} User response DTO
   * @private
   */
  private mapUserToResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
