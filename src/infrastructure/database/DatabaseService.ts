// src/infrastructure/database/DatabaseService.ts
import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private static instance: PrismaClient | null = null;

  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      try {
        DatabaseService.instance = new PrismaClient({
          errorFormat: 'minimal',
          log: ['query', 'info', 'warn', 'error'],
        });

        // Test the connection
        DatabaseService.instance.$connect()
          .then(() => console.log('PrismaClient connected successfully'))
          .catch((error: Error) => console.error('PrismaClient connection failed:', error));

      } catch (error) {
        console.error('Failed to initialize PrismaClient:', error);
        throw error;
      }
    }
    return DatabaseService.instance;
  }

  static async connect(): Promise<void> {
    try {
      const instance = this.getInstance();
      await instance.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (!DatabaseService.instance) return;

    try {
      await DatabaseService.instance.$disconnect();
      DatabaseService.instance = null;
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect from database:', error);
      throw error;
    }
  }
}
