/** @fileoverview Repository implementation for User entity using Prisma ORM */

import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { DatabaseService } from '../DatabaseService';

/**
 * Repository implementation for User entity using Prisma ORM
 * @implements {IUserRepository}
 */
export class PrismaUserRepository implements IUserRepository {
  private prisma: PrismaClient;

  /**
   * Creates an instance of PrismaUserRepository
   */
  constructor() {
    this.prisma = DatabaseService.getInstance();
  }

  /**
   * Finds a user by email
   * @param {string} email - The email to search for
   * @returns {Promise<User | null>} The found user or null
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.hashedPassword,
      user.name,
      user.createdAt,
      user.updatedAt
    );
  }

  /**
   * Finds a user by ID
   * @param {string} id - The ID to search for
   * @returns {Promise<User | null>} The found user or null
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.hashedPassword,
      user.name,
      user.createdAt,
      user.updatedAt
    );
  }

  /**
   * Creates a new user
   * @param {User} user - The user to create
   * @returns {Promise<User>} The created user
   */
  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        hashedPassword: user.hashedPassword,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    return new User(
      created.id,
      created.email,
      created.hashedPassword,
      created.name,
      created.createdAt,
      created.updatedAt
    );
  }

  /**
   * Updates an existing user
   * @param {string} id - ID of the user to update
   * @param {Partial<User>} data - The data to update
   * @returns {Promise<User>} The updated user
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return new User(
      updated.id,
      updated.email,
      updated.hashedPassword,
      updated.name,
      updated.createdAt,
      updated.updatedAt
    );
  }
}
