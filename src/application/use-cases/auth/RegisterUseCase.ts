// src/application/use-cases/auth/RegisterUseCase.ts
import { RegisterRequest, UserResponse } from '@/application/dtos/AuthDTO';
import { AuthService } from '@/domain/services/AuthService';

/**
 * Use case responsible for handling user registration
 * @class RegisterUseCase
 */
export class RegisterUseCase {
  /**
   * Creates an instance of RegisterUseCase
   * @param {AuthService} authService - Service for handling authentication operations
   */
  constructor(private readonly authService: AuthService) { }

  /**
   * Execute the registration use case
   * @param {RegisterRequest} userData - User registration data including email and password
   * @returns {Promise<UserResponse>} User data and authentication tokens
   * @throws {Error} If registration fails due to invalid data or server error
   */
  async execute(userData: RegisterRequest): Promise<UserResponse> {
    return await this.authService.register(userData)
      .catch((error) => {
        throw new Error(error.message);
      });
  }
}
