// src/application/use-cases/auth/RegisterUseCase.ts
import { RegisterRequest, UserResponse } from '@/application/dtos/AuthDTO';
import { AuthService } from '@/domain/services/AuthService';

export class RegisterUseCase {
  constructor(private readonly authService: AuthService) { }

  /**
   * Execute the registration use case
   * @param userData User registration data
   * @returns Authentication tokens
   * @throws Error if registration fails
   */
  async execute(userData: RegisterRequest): Promise<UserResponse> {
    return await this.authService.register(userData)
      .catch((error) => {
        throw new Error(error.message);
      });
  }
}
