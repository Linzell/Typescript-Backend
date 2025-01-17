// src/infrastructure/database/DatabaseService.test.ts
import { describe, expect, test, afterAll, mock, beforeEach } from "bun:test";
import { DatabaseService } from "./DatabaseService";

// Create mock functions
const mockConnect = mock(() => Promise.resolve());
const mockDisconnect = mock(() => Promise.resolve());
const mockQueryRaw = mock(() => Promise.resolve([{ result: 1 }]));

// Create mock PrismaClient class
class MockPrismaClient {
  $connect = mockConnect;
  $disconnect = mockDisconnect;
  $queryRaw = mockQueryRaw;
  errorFormat = 'minimal';
  log = ['query', 'info', 'warn', 'error'];
}

declare global {
  var PrismaClient: any;
}

// Mock PrismaClient globally
globalThis.PrismaClient = MockPrismaClient;

describe("DatabaseService", () => {
  beforeEach(() => {
    // Reset mocks and DatabaseService instance before each test
    mockConnect.mockReset();
    mockDisconnect.mockReset();
    mockQueryRaw.mockReset();
    DatabaseService['instance'] = null;
  });

  afterAll(() => {
    DatabaseService['instance'] = null;
  });

  test("should return a database instance", () => {
    // Act
    const instance = DatabaseService.getInstance();

    // Assert
    expect(instance).toBeDefined();
    expect(instance.$connect).toBeDefined();
  });

  test("should maintain singleton pattern", () => {
    // Act
    const firstInstance = DatabaseService.getInstance();
    const secondInstance = DatabaseService.getInstance();

    // Assert
    expect(firstInstance).toBe(secondInstance);
  });

  test("should successfully connect to database", async () => {
    // Act
    await DatabaseService.connect();

    // Assert
    expect(mockConnect.mock.calls.length).toBe(2); // One from getInstance, one from connect
  });

  test("should successfully execute queries", async () => {
    // Arrange
    const expectedResult = [{ result: 1 }];
    const instance = DatabaseService.getInstance();

    // Act
    const result = await instance.$queryRaw`SELECT 1 as result`;

    // Assert
    expect(mockQueryRaw.mock.calls.length).toBe(1);
    expect(result).toEqual(expectedResult);
  });

  test("should disconnect successfully", async () => {
    // Arrange
    DatabaseService.getInstance(); // Ensure instance exists

    // Act
    await DatabaseService.disconnect();

    // Assert
    expect(mockDisconnect.mock.calls.length).toBe(1);
  });

  test("should handle connection errors", async () => {
    // Arrange
    const errorMessage = "Connection failed";
    mockConnect.mockImplementation(() => Promise.reject(new Error(errorMessage)));

    // Act & Assert
    expect(DatabaseService.connect()).rejects.toThrow(errorMessage);
  });

  test("should handle disconnect errors", async () => {
    // Arrange
    const errorMessage = "Disconnect failed";
    mockDisconnect.mockImplementation(() => Promise.reject(new Error(errorMessage)));
    DatabaseService.getInstance(); // Ensure instance exists

    // Act & Assert
    expect(DatabaseService.disconnect()).rejects.toThrow(errorMessage);
  });
});
