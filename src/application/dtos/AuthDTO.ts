// src/application/dtos/AuthDTO.ts
import { z } from 'zod';

/**
 * DTO schema for login request payload
 * @property {string} email - User's email address
 * @property {string} password - User's password (min 6 characters)
 */
export const LoginRequestDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

/**
 * DTO schema for user registration request payload
 * @property {string} email - User's email address
 * @property {string} password - User's password (min 6 characters)
 * @property {string} name - User's name (min 2 characters)
 */
export const RegisterRequestDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

/**
 * DTO schema for user response data
 * @property {string} id - User's unique identifier
 * @property {string} email - User's email address
 * @property {string} name - User's name
 */
export const UserResponseDTO = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

/**
 * Type definition for login request data
 */
export type LoginRequest = z.infer<typeof LoginRequestDTO>;

/**
 * Type definition for registration request data
 */
export type RegisterRequest = z.infer<typeof RegisterRequestDTO>;

/**
 * Type definition for user response data
 */
export type UserResponse = z.infer<typeof UserResponseDTO>;
