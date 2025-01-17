// src/application/use-cases/auth/LoginUseCase.ts
import { LoginRequest, UserResponse } from '@/application/dtos/AuthDTO';
import { AuthService } from '@/domain/services/AuthService';

export class LoginUseCase {
  constructor(private readonly authService: AuthService) { }

  /**
   * Execute the login use case
   * @param credentials User login credentials
   * @returns Authentication tokens
   * @throws Error if authentication fails
   */
  async execute(credentials: LoginRequest): Promise<UserResponse> {

    return await this.authService.authenticate(credentials)
      .catch((error) => {
        throw new Error(error.message);
      });
  }
}
