// src/config.test.ts
import { describe, expect, test, beforeEach } from "bun:test";
import { Config } from "./config";

describe("Config", () => {
  beforeEach(() => {
    // Clear module cache before each test
    for (const key in require.cache) {
      delete require.cache[key];
    }

    // Reset to test environment defaults
    process.env = {
      NODE_ENV: 'test',
      DB_HOST: "testhost",
      DB_USER: "testuser",
      DB_PASSWORD: "testpass",
      DB_NAME: "testdb",
      DB_PORT: "5432",
      DB_POOL_SIZE: "20",
      DATABASE_URL: "postgresql://testuser:testpass@testhost:5432/testdb",
      PORT: "3000",
      FRONTEND_URL: "http://localhost:3000",
      FDA_API_KEY: "test-fda-api-key",
      JWT_ACCESS_SECRET: "test-access-secret-key",
      JWT_REFRESH_SECRET: "test-refresh-secret-key"
    };
  });

  describe("FRONTEND_URL", () => {
    test("should use test environment value", async () => {
      const { config } = await import('./config');
      expect(config.FRONTEND_URL).toBe("http://localhost:3000");
    });

    test("should use default value when environment variable is removed", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = 'test';
      const { config } = await import('./config');
      expect(config.FRONTEND_URL).toBe("http://localhost:3000");
    });
  });

  describe("DATABASE", () => {
    test("should use test database configuration", async () => {
      const { config } = await import('./config');
      expect(config.DATABASE).toEqual({
        user: "testuser",
        password: "testpass",
        host: "testhost",
        port: 5432,
        database: "testdb",
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    });

    test("should use default values when environment variables are not provided", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = 'test';

      const { config } = await import('./config');
      expect(config.DATABASE).toEqual({
        user: undefined,
        password: undefined,
        host: "localhost",
        port: 5432,
        database: undefined,
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    });

    test("should set ssl to false in non-production environment", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = "development";
      const { config } = await import('./config');
      expect(config.DATABASE.ssl).toBe(false);
    });

    test("should handle invalid port number", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = 'test';
      process.env.DB_PORT = "invalid";
      const { config } = await import('./config');
      expect(config.DATABASE.port).toBe(5432);
    });

    test("should handle invalid pool size", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = 'test';
      process.env.DB_POOL_SIZE = "invalid";
      const { config } = await import('./config');
      expect(config.DATABASE.max).toBe(20);
    });
  });

  describe("FDA_API_KEY", () => {
    test("should use test environment value", async () => {
      const { config } = await import('./config');
      expect(config.FDA_API_KEY).toBe("test-fda-api-key");
    });

    test("should use empty string when environment variable is removed", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = 'test';
      const { config } = await import('./config');
      expect(config.FDA_API_KEY).toBe("");
    });
  });

  describe("JWT secrets", () => {
    test("should use test environment JWT secrets", async () => {
      const { config } = await import('./config');
      expect(config.JWT_ACCESS_SECRET).toBe("test-access-secret-key");
      expect(config.JWT_REFRESH_SECRET).toBe("test-refresh-secret-key");
    });

    test("should use default values when environment variables are removed", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = 'test';
      const { config } = await import('./config');
      expect(config.JWT_ACCESS_SECRET).toBe("your-secret-key");
      expect(config.JWT_REFRESH_SECRET).toBe("your-refresh-secret-key");
    });
  });

  describe("PORT", () => {
    test("should use test environment port", async () => {
      const { config } = await import('./config');
      expect(config.PORT).toBe(3000);
    });

    test("should use default value when environment variable is removed", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = 'test';
      const { config } = await import('./config');
      expect(config.PORT).toBe(3000);
    });

    test("should handle invalid port number", async () => {
      // Clear all environment variables
      for (const key in process.env) {
        delete process.env[key];
      }
      process.env.NODE_ENV = 'test';
      process.env.PORT = "invalid";
      const { config } = await import('./config');
      expect(config.PORT).toBe(3000);
    });
  });

  describe("Type safety", () => {
    test("should maintain correct types for all configuration values", async () => {
      const { config } = await import('./config');
      const configKeys: (keyof Config)[] = [
        "FRONTEND_URL",
        "DATABASE",
        "FDA_API_KEY",
        "JWT_ACCESS_SECRET",
        "JWT_REFRESH_SECRET",
        "PORT"
      ];

      configKeys.forEach(key => {
        expect(config[key]).toBeDefined();
      });

      expect(typeof config.PORT).toBe("number");
      expect(typeof config.FRONTEND_URL).toBe("string");
      expect(typeof config.FDA_API_KEY).toBe("string");
      expect(typeof config.JWT_ACCESS_SECRET).toBe("string");
      expect(typeof config.JWT_REFRESH_SECRET).toBe("string");
      expect(typeof config.DATABASE).toBe("object");
    });
  });
});
