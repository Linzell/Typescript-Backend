// src/domain/errors/AuthError.test.ts
import { describe, expect, it } from "bun:test";
import { AuthError } from "./AuthError";

describe("AuthError", () => {
  it("should create an error with invalid credentials", () => {
    const error = new AuthError(
      "Invalid email or password",
      "INVALID_CREDENTIALS"
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.message).toBe("Invalid email or password");
    expect(error.code).toBe("INVALID_CREDENTIALS");
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe("AuthError");
  });

  it("should create an error with email exists", () => {
    const error = new AuthError(
      "Email already exists",
      "EMAIL_EXISTS"
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.message).toBe("Email already exists");
    expect(error.code).toBe("EMAIL_EXISTS");
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe("AuthError");
  });

  it("should create an error with invalid token", () => {
    const error = new AuthError(
      "Invalid token",
      "INVALID_TOKEN"
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.message).toBe("Invalid token");
    expect(error.code).toBe("INVALID_TOKEN");
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe("AuthError");
  });

  it("should allow custom status code", () => {
    const error = new AuthError(
      "Custom error",
      "INVALID_TOKEN",
      403
    );

    expect(error.statusCode).toBe(403);
  });
});
