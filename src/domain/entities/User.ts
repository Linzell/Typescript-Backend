// src/domain/entities/User.ts
/**
 * Represents a user entity in the system.
 */
export class User {
  /**
   * Creates a new User instance.
   * @param id - The unique identifier of the user
   * @param email - The email address of the user
   * @param hashedPassword - The hashed password of the user
   * @param name - The full name of the user
   * @param createdAt - The timestamp when the user was created
   * @param updatedAt - The timestamp when the user was last updated
   */
  constructor(
    public id: string,
    public email: string,
    public hashedPassword: string,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date
  ) { }

  /**
   * Creates a new User instance with generated id and timestamps.
   * @param params - The parameters required to create a user
   * @param params.email - The email address of the user
   * @param params.hashedPassword - The hashed password of the user
   * @param params.name - The full name of the user
   * @returns A new User instance
   */
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
