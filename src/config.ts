// src/config.ts

import { PoolConfig } from 'pg';

/**
 * Configuration object for the application
 */
export interface Config {
  FRONTEND_URL: string;
  DATABASE: PoolConfig;
  FDA_API_KEY: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  PORT: number;
}

export const config: Config = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  DATABASE: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production',
    max: parseInt(process.env.DB_POOL_SIZE || '20'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  FDA_API_KEY: process.env.FDA_API_KEY || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  PORT: parseInt(process.env.PORT || '3000')
};
