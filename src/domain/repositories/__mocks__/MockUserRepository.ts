// src/domain/repositories/__mocks__/MockUserRepository.ts
import { IUserRepository } from '../IUserRepository';
import { User } from '@/domain/entities/User';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }
}
