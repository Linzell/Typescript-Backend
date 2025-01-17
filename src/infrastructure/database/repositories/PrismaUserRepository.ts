// src/infrastructure/database/repositories/PrismaUserRepository.ts
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { DatabaseService } from '../DatabaseService';

export class PrismaUserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseService.getInstance();
  }

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
