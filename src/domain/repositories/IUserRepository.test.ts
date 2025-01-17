// src/domain/repositories/IUserRepository.test.ts
import { describe, expect, it, beforeEach } from 'bun:test';
import { MockUserRepository } from './__mocks__/MockUserRepository';
import { User } from '@/domain/entities/User';

describe('UserRepository', () => {
  let repository: MockUserRepository;
  let testUser: User;

  beforeEach(() => {
    repository = new MockUserRepository();
    testUser = new User(
      '1',
      'test@example.com',
      'hashedPassword123',
      'Test User',
      new Date(),
      new Date()
    );
  });

  describe('findByEmail', () => {
    it('should return null when user does not exist', async () => {
      const result = await repository.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should return user when found by email', async () => {
      await repository.create(testUser);
      const result = await repository.findByEmail(testUser.email);
      expect(result).toEqual(testUser);
    });
  });

  describe('findById', () => {
    it('should return null when user does not exist', async () => {
      const result = await repository.findById('nonexistent-id');
      expect(result).toBeNull();
    });

    it('should return user when found by id', async () => {
      await repository.create(testUser);
      const result = await repository.findById(testUser.id);
      expect(result).toEqual(testUser);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const result = await repository.create(testUser);
      expect(result).toEqual(testUser);

      const savedUser = await repository.findById(testUser.id);
      expect(savedUser).toEqual(testUser);
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      await repository.create(testUser);

      const updatedData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const result = await repository.update(testUser.id, updatedData);

      expect(result.name).toBe(updatedData.name);
      expect(result.email).toBe(updatedData.email);
      expect(result.id).toBe(testUser.id);
    });

    it('should throw error when updating non-existent user', async () => {
      const updatePromise = repository.update('nonexistent-id', { name: 'New Name' });
      await expect(updatePromise).rejects.toThrow('User not found');
    });
  });
});
