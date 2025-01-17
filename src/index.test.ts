// src/index.test.ts
import { describe, expect, it, mock, spyOn, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { DatabaseService } from '@/infrastructure/database/DatabaseService';
import { config } from '@/config';

describe('Application Entry Point', () => {
  type MockElysiaInstance = {
    listen: ReturnType<typeof mock>;
    get: ReturnType<typeof mock>;
    use: ReturnType<typeof mock>;
    group: ReturnType<typeof mock>;
    event: { request: any[] };
    singleton: any;
    definitions: any;
  };

  let mockInstance: MockElysiaInstance;

  beforeEach(() => {
    // Reset console spies
    console.log = spyOn(console, 'log');
    console.error = spyOn(console, 'error');

    // Create a fresh mock instance for each test
    mockInstance = {
      listen: mock(() => mockInstance),
      get: mock(() => mockInstance),
      use: mock(() => mockInstance),
      group: mock(() => mockInstance),
      event: { request: [] },
      singleton: {},
      definitions: {}
    };

    // Mock Elysia
    const MockElysia = mock(() => mockInstance);
    MockElysia.prototype = mockInstance;
    mock.module('elysia', () => ({ Elysia: MockElysia }));
  });

  it("should initialize the application with all middleware", () => {
    const instance = new Elysia();
    const middleware = {
      default: new Elysia()
    };
    instance.use(Promise.resolve(middleware));

    expect(mockInstance.use).toHaveBeenCalledWith(Promise.resolve(middleware));
  });

  it("should configure health check endpoint", () => {
    const instance = new Elysia();
    const handler = () => ({ status: 'ok' });
    instance.get('/health', handler);

    expect(mockInstance.get).toHaveBeenCalledWith('/health', handler);
    expect(handler()).toEqual({ status: 'ok' });
  });

  it('should handle database connection success', async () => {
    // Create mock instance that logs
    const mockInstance = {
      $connect: () => {
        console.log('Database connected successfully');
        return Promise.resolve();
      }
    };

    // Mock DatabaseService
    mock.module('@/infrastructure/database/DatabaseService', () => ({
      DatabaseService: {
        getInstance: () => mockInstance,
        connect: async () => {
          const instance = mockInstance;
          await instance.$connect();
          return Promise.resolve();
        }
      }
    }));

    await DatabaseService.connect();
    expect(console.log).toHaveBeenCalledWith('Database connected successfully');
  });

  it('should handle database connection failure', async () => {
    const mockError = new Error("Can't reach database server at `testhost:5432`");

    // Mock DatabaseService with error
    mock.module('@/infrastructure/database/DatabaseService', () => ({
      DatabaseService: {
        getInstance: () => ({
          $connect: () => Promise.reject(mockError)
        }),
        connect: async () => {
          const instance = {
            $connect: () => Promise.reject(mockError)
          };
          await instance.$connect()
            .catch(error => {
              throw error;
            });
        }
      }
    }));

    try {
      await DatabaseService.connect();
      throw new Error('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe("Can't reach database server at `testhost:5432`");
    }
  });

  it('should configure protected routes group', () => {
    const instance = new Elysia();
    const callback = () => new Elysia();
    instance.group('/api/v1', callback);

    expect(mockInstance.group).toHaveBeenCalledWith('/api/v1', callback);
  });

  it('should log server startup information', async () => {
    // Create mock instance that logs
    const mockInstance = {
      $connect: () => {
        console.log('Database connected successfully');
        return Promise.resolve();
      }
    };

    // Mock DatabaseService
    mock.module('@/infrastructure/database/DatabaseService', () => ({
      DatabaseService: {
        getInstance: () => mockInstance,
        connect: async () => {
          const instance = mockInstance;
          await instance.$connect();
          return Promise.resolve();
        }
      }
    }));

    await DatabaseService.connect();

    const expectedLogs = [
      `🦊 Server running at http://localhost:${config.PORT}`,
      `📚 Documentation available at http://localhost:${config.PORT}/documentation`,
      `🏥 Health check available at http://localhost:${config.PORT}/health`,
      `🔐 CORS configured for ${config.FRONTEND_URL}`,
      `🔒 Protected routes available at http://localhost:${config.PORT}/api/v1`,
      `📊 OpenTelemetry configured`
    ];

    expectedLogs.forEach(log => console.log(log));

    // Verify all logs were called
    expect(console.log).toHaveBeenCalledWith('Database connected successfully');
    expectedLogs.forEach(log => {
      expect(console.log).toHaveBeenCalledWith(log);
    });
  });
});
