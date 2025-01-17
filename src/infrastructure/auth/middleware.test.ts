// src/infrastructure/auth/middleware.test.ts
import { describe, expect, test, beforeEach, mock } from "bun:test";
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { createAuthMiddleware } from "./middleware";
import { JWTPayload } from "./types/auth";
import { config } from "@/config";

describe("Auth Middleware", () => {
  let app: Elysia;

  beforeEach(() => {
    app = new Elysia()
      .use(jwt({
        name: 'jwt',
        secret: config.JWT_ACCESS_SECRET,
        exp: '24h'
      }));
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

    const handler = middleware.derive;
    handler(context as any);

    const result = context as any;

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

    const handler = middleware.derive;
    handler(context as any);

    const result = context as any;

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

    const handler = middleware.derive;
    handler(context as any);

    const result = context as any;

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

    const handler = middleware.derive;
    handler(context as any);

    const result = context as any;

    expect(result.success).toBe(false);
    expect(result.error.code).toBe('AUTH_ERROR');
    expect(context.set.status).toBe(401);
  });
});
