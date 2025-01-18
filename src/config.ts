// src/config.ts

import { PoolConfig } from 'pg';

/**
 * Configuration interface for the application
 * @interface Config
 * @property {string} FRONTEND_URL - URL of the frontend application
 * @property {PoolConfig} DATABASE - Database connection configuration
 * @property {string} FDA_API_KEY - API key for FDA drug data
 * @property {string} JWT_ACCESS_SECRET - Secret for JWT access tokens
 * @property {string} JWT_REFRESH_SECRET - Secret for JWT refresh tokens
 * @property {number} PORT - Port number for the server
 */
export interface Config {
  FRONTEND_URL: string;
  DATABASE: PoolConfig;
  FDA_API_KEY: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  PORT: number;
}

/**
 * Safely parse an integer with a fallback value
 * @param {string | undefined} value - The string value to parse
 * @param {number} defaultValue - The default value to return if parsing fails
 * @returns {number} The parsed integer or the default value
 */
const safeParseInt = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Application configuration object loaded from environment variables
 * @constant
 * @type {Config}
 * @default
 * @property {string} FRONTEND_URL - Frontend URL defaulting to localhost:3000
 * @property {Object} DATABASE - Database connection settings
 * @property {string} FDA_API_KEY - FDA API key
 * @property {string} JWT_ACCESS_SECRET - JWT access token secret
 * @property {string} JWT_REFRESH_SECRET - JWT refresh token secret
 * @property {number} PORT - Server port defaulting to 3000
 */
export const config: Config = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  DATABASE: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: safeParseInt(process.env.DB_PORT, 5432),
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production',
    max: safeParseInt(process.env.DB_POOL_SIZE, 20),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  FDA_API_KEY: process.env.FDA_API_KEY || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  PORT: safeParseInt(process.env.PORT, 3000)
};
