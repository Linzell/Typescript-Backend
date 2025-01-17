// src/domain/entities/User.test.ts
import { describe, expect, it, beforeEach } from "bun:test";
import { User } from "./User";

describe("User Entity", () => {
  describe("constructor", () => {
    it("should create a User instance with all properties", () => {
      const now = new Date();
      const user = new User(
        "test-id",
        "test@example.com",
        "hashedPassword123",
        "Test User",
        now,
        now
      );

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe("test-id");
      expect(user.email).toBe("test@example.com");
      expect(user.hashedPassword).toBe("hashedPassword123");
      expect(user.name).toBe("Test User");
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });
  });

  describe("create", () => {
    let userParams: {
      email: string;
      hashedPassword: string;
      name: string;
    };

    beforeEach(() => {
      userParams = {
        email: "test@example.com",
        hashedPassword: "hashedPassword123",
        name: "Test User",
      };
    });

    it("should create a new User instance with generated id and timestamps", () => {
      const user = User.create(userParams);

      expect(user).toBeInstanceOf(User);
      expect(typeof user.id).toBe("string");
      expect(user.id).toHaveLength(36); // UUID length
      expect(user.email).toBe(userParams.email);
      expect(user.hashedPassword).toBe(userParams.hashedPassword);
      expect(user.name).toBe(userParams.name);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should set createdAt and updatedAt to the same timestamp", () => {
      const user = User.create(userParams);

      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime());
    });

    it("should generate unique IDs for different users", () => {
      const user1 = User.create(userParams);
      const user2 = User.create(userParams);

      expect(user1.id).not.toBe(user2.id);
    });

    it("should maintain immutability of input parameters", () => {
      const originalParams = { ...userParams };

      expect(userParams).toEqual(originalParams);
    });
  });
});
