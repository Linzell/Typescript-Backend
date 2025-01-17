// test/setup.ts
import { beforeEach, mock } from "bun:test";

beforeEach(() => {
  // Reset environment variables
  process.env = {
    NODE_ENV: 'test',
    DB_HOST: "localhost",
    DB_USER: "testuser",
    DB_PASSWORD: "testpass",
    DB_NAME: "testdb",
    DB_PORT: "5432",
    DB_POOL_SIZE: "20",
    DATABASE_URL: "postgresql://testuser:testpass@localhost:5432/testdb",
    PORT: "3000",
    FRONTEND_URL: "http://localhost:3000",
    FDA_API_KEY: "test-fda-api-key",
    JWT_ACCESS_SECRET: "test-access-secret-key",
    JWT_REFRESH_SECRET: "test-refresh-secret-key",
  };
});

// Mock PrismaClient
const mockPrismaInstance = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $queryRaw: () => Promise.resolve([{ result: 1 }]),
};

// Mock modules globally
mock.module('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      return mockPrismaInstance;
    }
  }
}));
