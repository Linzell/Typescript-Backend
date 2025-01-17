// src/application/dtos/AuthDTO.ts
import { z } from 'zod';

export const LoginRequestDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const RegisterRequestDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

export const UserResponseDTO = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

export type LoginRequest = z.infer<typeof LoginRequestDTO>;
export type RegisterRequest = z.infer<typeof RegisterRequestDTO>;
export type UserResponse = z.infer<typeof UserResponseDTO>;
