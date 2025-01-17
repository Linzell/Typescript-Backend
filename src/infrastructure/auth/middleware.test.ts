// src/infrastructure/auth/middleware.test.ts
import { describe, expect, test, beforeEach, mock } from "bun:test";
import { createAuthMiddleware } from "./middleware";
import { JWTPayload } from "./types/auth";
import { MockElysia } from "./__mocks__/elysia.mock";

// Mock modules
mock.module('elysia', () => ({
  Elysia: MockElysia
}));

mock.module('@elysiajs/jwt', () => ({
  jwt: (_config: any) => (app: any) => {
    app.jwt = {
      sign: async () => 'mock.token',
      verify: async () => ({ userId: '123', email: 'test@example.com', roles: ['user'] })
    };
    return app;
  }
}));

describe("Auth Middleware", () => {
  let app: MockElysia;

  beforeEach(() => {
    app = new MockElysia();
  });

  test("should allow access with valid token", async () => {
    const payload: JWTPayload = {
      userId: "123",
      email: "test@example.com",
      roles: ["user"]
    };

    const middleware = createAuthMiddleware(app);
    const context = {
      jwt: {
        sign: mock(() => Promise.resolve("test.token.here")),
        verify: mock(() => Promise.resolve(payload))
      },
      cookie: {
        auth: {
          value: "test.token.here",
          remove: () => { }
        }
      },
      set: {
        status: 200
      }
    };

    const result = await middleware(context);

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.userId).toBe(payload.userId);
    expect(result.user.email).toBe(payload.email);
  });

  test("should reject requests without auth cookie", async () => {
    const middleware = createAuthMiddleware(app);
    const context = {
      jwt: {
        verify: mock(() => Promise.reject(new Error("Unauthorized")))
      },
      cookie: {
        auth: {
          value: undefined,
          remove: () => { }
        }
      },
      set: {
        status: 200
      }
    };

    const result = await middleware(context);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe('UNAUTHORIZED');
    expect(context.set.status).toBe(401);
  });

  test("should reject requests with invalid token", async () => {
    const middleware = createAuthMiddleware(app);
    const context = {
      jwt: {
        verify: mock(() => Promise.reject(new Error("Invalid token")))
      },
      cookie: {
        auth: {
          value: "invalid.token",
          remove: () => { }
        }
      },
      set: {
        status: 200
      }
    };

    const result = await middleware(context);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe('AUTH_ERROR');
    expect(context.set.status).toBe(401);
  });

  test("should handle expired tokens", async () => {
    const middleware = createAuthMiddleware(app);
    const context = {
      jwt: {
        verify: mock(() => Promise.reject(new Error("Token expired")))
      },
      cookie: {
        auth: {
          value: "expired.token",
          remove: () => { }
        }
      },
      set: {
        status: 200
      }
    };

    const result = await middleware(context);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe('AUTH_ERROR');
    expect(context.set.status).toBe(401);
  });

  test("should validate payload structure", async () => {
    const middleware = createAuthMiddleware(app);
    const invalidPayload = {
      // Missing required fields
      someOtherField: "value"
    };

    const context = {
      jwt: {
        verify: mock(() => Promise.resolve(invalidPayload))
      },
      cookie: {
        auth: {
          value: "token.with.invalid.payload",
          remove: () => { }
        }
      },
      set: {
        status: 200
      }
    };

    const result = await middleware(context);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe('INVALID_TOKEN');
    expect(context.set.status).toBe(401);
  });
});
