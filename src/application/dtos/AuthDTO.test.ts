// src/application/dtos/AuthDTO.test.ts
import { expect, describe, test } from "bun:test";
import {
  LoginRequestDTO,
  RegisterRequestDTO,
  UserResponseDTO
} from "./AuthDTO";

describe("AuthDTO", () => {
  describe("LoginRequestDTO", () => {
    test("should validate valid login request", () => {
      const validLogin = {
        email: "test@example.com",
        password: "password123"
      };

      const result = LoginRequestDTO.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    test("should reject invalid email", () => {
      const invalidEmail = {
        email: "invalid-email",
        password: "password123"
      };

      const result = LoginRequestDTO.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    test("should reject short password", () => {
      const shortPassword = {
        email: "test@example.com",
        password: "12345"
      };

      const result = LoginRequestDTO.safeParse(shortPassword);
      expect(result.success).toBe(false);
    });
  });

  describe("RegisterRequestDTO", () => {
    test("should validate valid register request", () => {
      const validRegister = {
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      };

      const result = RegisterRequestDTO.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    test("should reject invalid email", () => {
      const invalidEmail = {
        email: "invalid-email",
        password: "password123",
        name: "Test User"
      };

      const result = RegisterRequestDTO.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    test("should reject short name", () => {
      const shortName = {
        email: "test@example.com",
        password: "password123",
        name: "T"
      };

      const result = RegisterRequestDTO.safeParse(shortName);
      expect(result.success).toBe(false);
    });

    test("should reject short password", () => {
      const shortPassword = {
        email: "test@example.com",
        password: "12345",
        name: "Test User"
      };

      const result = RegisterRequestDTO.safeParse(shortPassword);
      expect(result.success).toBe(false);
    });
  });

  describe("UserResponseDTO", () => {
    test("should validate valid user response", () => {
      const validResponse = {
        id: "123",
        email: "test@example.com",
        name: "Test User"
      };

      const result = UserResponseDTO.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    test("should reject missing fields", () => {
      const invalidResponse = {
        id: "123",
        email: "test@example.com"
      };

      const result = UserResponseDTO.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });
});
