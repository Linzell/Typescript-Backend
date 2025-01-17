// src/infrastructure/database/DatabaseService.ts
import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private static instance: PrismaClient | null = null;

  /**
   * Get the database instance (creates one if it doesn't exist)
   */
  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        errorFormat: 'minimal',
        log: ['query', 'info', 'warn', 'error'],
      });
    }
    return DatabaseService.instance;
  }

  /**
   * Connect to the database
   */
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

  /**
   * Disconnect from the database and clear the instance
   */
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

// Export the methods for use in tests
export const { getInstance, connect, disconnect } = DatabaseService;
