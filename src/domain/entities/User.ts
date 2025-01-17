// src/domain/entities/User.ts
export class User {
  constructor(
    public id: string,
    public email: string,
    public hashedPassword: string,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date
  ) { }

  static create(params: {
    email: string;
    hashedPassword: string;
    name: string;
  }): User {
    const now = new Date();
    return new User(
      crypto.randomUUID(),
      params.email,
      params.hashedPassword,
      params.name,
      now,
      now
    );
  }
}
