// src/infrastructure/database/DatabaseService.ts
import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient();
    }
    return DatabaseService.instance;
  }
}
