// src/infrastructure/database/DatabaseService.ts
import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private static instance: PrismaClient | null = null;

  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        errorFormat: 'minimal',
        log: ['query', 'info', 'warn', 'error'],
      });
    }

    // Test the connection
    DatabaseService.instance.$connect()
      .then(() => console.log('PrismaClient connected successfully'))
      .catch((error: Error) => console.error('PrismaClient connection failed:', error));

    return DatabaseService.instance;
  }

  static async connect(): Promise<void> {
    try {
      const instance = this.getInstance();
      await instance.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown database connection error';
      throw new Error(message);
    }
  }

  static async disconnect(): Promise<void> {
    if (!this.instance) return;

    try {
      await this.instance.$disconnect();
      this.instance = null;
      console.log('Database disconnected successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown database disconnection error';
      throw new Error(message);
    }
  }
}
