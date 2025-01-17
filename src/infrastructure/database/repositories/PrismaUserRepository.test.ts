// src/infrastructure/database/repositories/PrismaUserRepository.test.ts
import { describe, expect, test, beforeEach, mock } from "bun:test";
import { PrismaUserRepository } from "./PrismaUserRepository";
import { User } from "@/domain/entities/User";
import { User as PrismaUser } from "@prisma/client";

// Mock user data with proper typing
const mockUser: PrismaUser = {
  id: "123",
  email: "test@example.com",
  hashedPassword: "hashedPassword123",
  name: "Test User",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock Prisma client methods with proper typing
const mockPrismaUser = {
  findUnique: mock(async () => mockUser as PrismaUser | null),
  create: mock(async ({ data }: { data: any }) => data as PrismaUser),
  update: mock(async ({ data }: { data: any }) => ({ ...mockUser, ...data }) as PrismaUser)
};

// Type for mocked PrismaClient
type MockPrismaClient = {
  user: {
    findUnique: typeof mockPrismaUser.findUnique;
    create: typeof mockPrismaUser.create;
    update: typeof mockPrismaUser.update;
  };
};

// Mock DatabaseService with proper typing
mock.module("../DatabaseService", () => ({
  DatabaseService: {
    getInstance: () => ({
      user: mockPrismaUser
    } as unknown as MockPrismaClient)
  }
}));

describe("PrismaUserRepository", () => {
  let repository: PrismaUserRepository;

  beforeEach(() => {
    // Reset mocks
    mockPrismaUser.findUnique.mockReset();
    mockPrismaUser.create.mockReset();
    mockPrismaUser.update.mockReset();

    repository = new PrismaUserRepository();
  });

  describe("findByEmail", () => {
    test("should return user when found", async () => {
      const email = "test@example.com";
      mockPrismaUser.findUnique.mockImplementation(async () => mockUser);

      const result = await repository.findByEmail(email);

      expect(result).toBeDefined();
      expect(result?.email).toBe(email);
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email }
      });
    });

    test("should return null when user not found", async () => {
      mockPrismaUser.findUnique.mockImplementation(async () => null);

      const result = await repository.findByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    test("should return user when found", async () => {
      const id = "123";
      mockPrismaUser.findUnique.mockImplementation(async () => mockUser);

      const result = await repository.findById(id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(id);
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id }
      });
    });

    test("should return null when user not found", async () => {
      mockPrismaUser.findUnique.mockImplementation(async () => null);

      const result = await repository.findById("nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    test("should create and return new user", async () => {
      const newUser = new User(
        mockUser.id,
        mockUser.email,
        mockUser.hashedPassword,
        mockUser.name,
        mockUser.createdAt,
        mockUser.updatedAt
      );

      mockPrismaUser.create.mockImplementation(async ({ data }) => ({
        ...data,
        id: mockUser.id,
      } as PrismaUser));

      const result = await repository.create(newUser);

      expect(result).toBeDefined();
      expect(result.id).toBe(newUser.id);
      expect(result.email).toBe(newUser.email);
      expect(mockPrismaUser.create).toHaveBeenCalledWith({
        data: {
          id: newUser.id,
          email: newUser.email,
          hashedPassword: newUser.hashedPassword,
          name: newUser.name,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        }
      });
    });

    test("should throw error on creation failure", async () => {
      const error = new Error("Creation failed");
      mockPrismaUser.create.mockImplementation(async () => { throw error; });

      const newUser = new User(
        mockUser.id,
        mockUser.email,
        mockUser.hashedPassword,
        mockUser.name,
        mockUser.createdAt,
        mockUser.updatedAt
      );

      await expect(repository.create(newUser)).rejects.toThrow("Creation failed");
    });
  });

  describe("update", () => {
    test("should update and return user", async () => {
      const id = "123";
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com"
      };

      mockPrismaUser.update.mockImplementation(async ({ data }) => ({
        ...mockUser,
        ...data,
      } as PrismaUser));

      const result = await repository.update(id, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.email).toBe(updateData.email);
      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          ...updateData,
          updatedAt: expect.any(Date)
        }
      });
    });

    test("should throw error when user not found", async () => {
      const error = new Error("User not found");
      mockPrismaUser.update.mockImplementation(async () => { throw error; });

      await expect(repository.update("nonexistent-id", { name: "New Name" }))
        .rejects.toThrow("User not found");
    });
  });

  describe("error handling", () => {
    test("should handle database connection errors", async () => {
      const error = new Error("Database connection failed");
      mockPrismaUser.findUnique.mockImplementation(async () => { throw error; });

      await expect(repository.findByEmail("test@example.com"))
        .rejects.toThrow("Database connection failed");
    });

    test("should handle invalid data errors", async () => {
      const error = new Error("Invalid data");
      mockPrismaUser.create.mockImplementation(async () => { throw error; });

      const invalidUser = new User(
        "",
        "invalid-email",
        "password",
        "",
        new Date(),
        new Date()
      );

      await expect(repository.create(invalidUser)).rejects.toThrow("Invalid data");
    });
  });
});
