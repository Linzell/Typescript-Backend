// src/domain/repositories/IUserRepository.ts
import { User } from '@/domain/entities/User';

/**
 * Repository interface for User entity operations
 * @interface IUserRepository
 */
export interface IUserRepository {
  /**
   * Find a user by their email
   * @param {string} email - User's email address
   * @returns {Promise<User | null>} - Returns User if found, null otherwise
   * @throws {Error} If database query fails
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by their ID
   * @param {string} id - User's unique identifier
   * @returns {Promise<User | null>} - Returns User if found, null otherwise
   * @throws {Error} If database query fails
   */
  findById(id: string): Promise<User | null>;

  /**
   * Create a new user
   * @param {User} user - User entity to create
   * @returns {Promise<User>} - Created user with generated ID
   * @throws {Error} If user creation fails
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user
   * @param {string} id - User's ID
   * @param {Partial<User>} data - Updated user data
   * @returns {Promise<User>} - Updated user
   * @throws {Error} If user update fails or user not found
   */
  update(id: string, data: Partial<User>): Promise<User>;
}
