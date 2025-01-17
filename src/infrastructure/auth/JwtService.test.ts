// src/infrastructure/auth/JwtService.test.ts
import { describe, expect, test } from "bun:test";
import { createJwtPlugin } from "./JwtService";

describe("JwtService", () => {
  test("should successfully setup JWT authentication", async () => {
    // Arrange
    const secret = "test-secret";

    // Act
    const jwtPlugin = createJwtPlugin(secret);

    // Assert
    expect(jwtPlugin).toBeDefined();
    expect(jwtPlugin.decorator).toHaveProperty("jwt");
  });

  test("should be able to sign and verify tokens", async () => {
    // Arrange
    const secret = "test-secret";
    const payload = { userId: "123", role: "user" };

    // Act
    const jwtPlugin = createJwtPlugin(secret);
    const token = await jwtPlugin.decorator.jwt.sign(payload);
    const verified = await jwtPlugin.decorator.jwt.verify(token);

    // Assert
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(verified).toBeDefined();
    expect(verified).toMatchObject(payload);
  });

  test("should return false for invalid token", async () => {
    // Arrange
    const secret = "test-secret";
    const invalidToken = "invalid.token.here";

    // Act
    const jwtPlugin = createJwtPlugin(secret);
    const verified = await jwtPlugin.decorator.jwt.verify(invalidToken);

    // Assert
    expect(verified).toBe(false);
  });

  test("should return different tokens for different payloads", async () => {
    // Arrange
    const secret = "test-secret";
    const payload1 = { userId: "123", role: "user" };
    const payload2 = { userId: "456", role: "admin" };

    // Act
    const jwtPlugin = createJwtPlugin(secret);
    const token1 = await jwtPlugin.decorator.jwt.sign(payload1);
    const token2 = await jwtPlugin.decorator.jwt.sign(payload2);

    // Assert
    expect(token1).not.toBe(token2);

    const verified1 = await jwtPlugin.decorator.jwt.verify(token1);
    const verified2 = await jwtPlugin.decorator.jwt.verify(token2);

    expect(verified1).toMatchObject(payload1);
    expect(verified2).toMatchObject(payload2);
  });

  test("should handle undefined token verification", async () => {
    // Arrange
    const secret = "test-secret";

    // Act
    const jwtPlugin = createJwtPlugin(secret);
    const verified = await jwtPlugin.decorator.jwt.verify(undefined);

    // Assert
    expect(verified).toBe(false);
  });
});
