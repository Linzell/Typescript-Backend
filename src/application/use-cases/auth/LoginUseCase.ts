// src/application/use-cases/auth/LoginUseCase.ts
import { LoginRequest, UserResponse } from '@/application/dtos/AuthDTO';
import { AuthService } from '@/domain/services/AuthService';

/**
 * Login Use Case
 * @description Handles user authentication by validating credentials and returning auth tokens
 */
export class LoginUseCase {
  /**
   * Creates a new login use case instance
   * @param authService Authentication service for handling auth operations
   */
  constructor(private readonly authService: AuthService) { }

  /**
   * Execute the login use case
   * @param credentials User login credentials containing email and password
   * @returns Promise containing user information and authentication tokens
   * @throws {Error} When authentication fails due to invalid credentials or server error
   * @example
   * ```ts
   * const loginUseCase = new LoginUseCase(authService);
   * const response = await loginUseCase.execute({
   *   email: "user@example.com",
   *   password: "password123"
   * });
   * ```
   */
  async execute(credentials: LoginRequest): Promise<UserResponse> {
    return await this.authService.authenticate(credentials)
      .catch((error) => {
        throw new Error(error.message);
      });
  }
}
