// src/infrastructure/database/DatabaseService.test.ts
import { describe, expect, test, beforeEach, mock } from "bun:test";
import { DatabaseService } from "./DatabaseService";

describe("DatabaseService", () => {
  beforeEach(() => {
    // Reset instance before each test
    // @ts-ignore - access private property for testing
    DatabaseService['instance'] = null;
  });

  test("should return a database instance", () => {
    const instance = DatabaseService.getInstance();
    expect(instance).toBeDefined();
    expect(typeof instance.$connect).toBe('function');
  });

  test("should maintain singleton pattern", () => {
    const firstInstance = DatabaseService.getInstance();
    const secondInstance = DatabaseService.getInstance();
    expect(firstInstance).toBe(secondInstance);
  });

  test("should connect successfully", async () => {
    const connectSpy = mock(() => Promise.resolve());
    // @ts-ignore - mock for testing
    DatabaseService.getInstance().$connect = connectSpy;

    await DatabaseService.connect();
    expect(connectSpy).toHaveBeenCalled();
  });

  test("should disconnect successfully", async () => {
    const disconnectSpy = mock(() => Promise.resolve());
    const instance = DatabaseService.getInstance();
    // @ts-ignore - mock for testing
    instance.$disconnect = disconnectSpy;

    await instance.$disconnect();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  test("should handle connection errors", async () => {
    const error = new Error("Connection failed");
    const connectSpy = mock(() => Promise.reject(error));
    // @ts-ignore - mock for testing
    DatabaseService.getInstance().$connect = connectSpy;

    expect(DatabaseService.connect()).rejects.toThrow("Connection failed");
  });

  test("should handle disconnection errors", async () => {
    const error = new Error("Disconnection failed");
    const disconnectSpy = mock(() => Promise.reject(error));
    const instance = DatabaseService.getInstance();
    // @ts-ignore - mock for testing
    instance.$disconnect = disconnectSpy;

    expect(instance.$disconnect()).rejects.toThrow("Disconnection failed");
  });

  test("should handle query execution", async () => {
    const expectedResult = [{ result: 1 }];
    const queryRawSpy = mock(() => Promise.resolve(expectedResult));
    // @ts-ignore - mock for testing
    DatabaseService.getInstance().$queryRaw = queryRawSpy;

    const instance = DatabaseService.getInstance();
    const result = await instance.$queryRaw`SELECT 1 as result`;

    expect(result).toEqual(expectedResult);
    expect(queryRawSpy).toHaveBeenCalled();
  });
});
