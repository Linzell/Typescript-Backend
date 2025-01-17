// src/domain/types/jwt.test.ts
import { expect, test, describe } from "bun:test";
import type { DecodedToken } from "./jwt";

describe("DecodedToken Interface", () => {
  test("should allow creation of valid token object with all properties", () => {
    const token: DecodedToken = {
      userId: "123",
      email: "test@example.com",
      exp: 1234567890,
      iat: 1234567800
    };

    expect(token).toEqual({
      userId: "123",
      email: "test@example.com",
      exp: 1234567890,
      iat: 1234567800
    });
  });

  test("should allow creation of token object with partial properties", () => {
    const token: DecodedToken = {
      userId: "123",
      email: "test@example.com"
    };

    expect(token).toEqual({
      userId: "123",
      email: "test@example.com"
    });
  });

  test("should allow creation of empty token object", () => {
    const token: DecodedToken = {};

    expect(token).toEqual({});
  });

  test("should maintain correct types for properties", () => {
    const token: DecodedToken = {
      userId: "123",
      email: "test@example.com",
      exp: 1234567890,
      iat: 1234567800
    };

    expect(typeof token.userId).toBe("string");
    expect(typeof token.email).toBe("string");
    expect(typeof token.exp).toBe("number");
    expect(typeof token.iat).toBe("number");
  });

  test("should allow undefined values for optional properties", () => {
    const token: DecodedToken = {
      userId: undefined,
      email: undefined,
      exp: undefined,
      iat: undefined
    };

    expect(token.userId).toBeUndefined();
    expect(token.email).toBeUndefined();
    expect(token.exp).toBeUndefined();
    expect(token.iat).toBeUndefined();
  });

  test("should allow mixing of defined and undefined properties", () => {
    const token: DecodedToken = {
      userId: "123",
      email: undefined,
      exp: 1234567890,
      iat: undefined
    };

    expect(token.userId).toBeDefined();
    expect(token.email).toBeUndefined();
    expect(token.exp).toBeDefined();
    expect(token.iat).toBeUndefined();
  });
});
