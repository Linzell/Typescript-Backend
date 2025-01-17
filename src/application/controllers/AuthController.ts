// src/application/controllers/AuthController.ts
import { LoginRequest, RegisterRequest, UserResponse } from '@/application/dtos/AuthDTO';
import { User } from '@/domain/entities/User';
import { AuthService } from '@/domain/services/AuthService';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';

export class AuthController {
  private authService: AuthService;

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
   * @param credentials Login credentials
   * @returns Authentication tokens
   */
  async login(credentials: LoginRequest): Promise<UserResponse> {
    const user = await this.authService.authenticate(credentials);
    return this.mapUserToResponse(user);
  }

  /**
   * Handle user registration request
   * @param userData Registration data
   * @returns User data
   */
  async register(userData: RegisterRequest): Promise<UserResponse> {
    const user = await this.authService.register(userData);
    return this.mapUserToResponse(user);
  }

  private mapUserToResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
