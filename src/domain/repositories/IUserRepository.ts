// src/domain/repositories/IUserRepository.ts
import { User } from '@/domain/entities/User';

export interface IUserRepository {
  /**
   * Find a user by their email
   * @param email - User's email address
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by their ID
   * @param id - User's unique identifier
   */
  findById(id: string): Promise<User | null>;

  /**
   * Create a new user
   * @param user - User entity to create
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user
   * @param id - User's ID
   * @param data - Updated user data
   */
  update(id: string, data: Partial<User>): Promise<User>;
}
