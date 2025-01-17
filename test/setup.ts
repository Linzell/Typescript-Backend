// test/setup.ts
import { beforeEach } from "bun:test";

beforeEach(() => {
  // Clear require cache
  for (const key in require.cache) {
    delete require.cache[key];
  }
});

process.env = {
  // Clear existing env vars first
  NODE_ENV: 'test',

  // Database configuration
  DB_HOST: "testhost",
  DB_USER: "testuser",
  DB_PASSWORD: "testpass",
  DB_NAME: "testdb",
  DB_PORT: "5432",
  DB_POOL_SIZE: "20",
  DATABASE_URL: "postgresql://testuser:testpass@testhost:5432/testdb",

  // Application configuration
  PORT: "3000",
  FRONTEND_URL: "http://localhost:3000",
  FDA_API_KEY: "test-fda-api-key",
  JWT_ACCESS_SECRET: "test-access-secret-key",
  JWT_REFRESH_SECRET: "test-refresh-secret-key",
};

// Mock PrismaClient for all tests
const mockPrismaClient = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $queryRaw: () => Promise.resolve([{ result: 1 }]),
};

// @ts-ignore - mock for testing
global.PrismaClient = function () {
  return mockPrismaClient;
};
