/**
 * @file Authentication routes configuration
 * @module authRoutes
 */

import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { AuthController } from '@/application/controllers/AuthController';
import {
  LoginRequestDTO,
  RegisterRequestDTO
} from '@/application/dtos/AuthDTO';

import { config } from '@/config';

/**
 * Configures and returns authentication routes
 * @param {Elysia} app - The Elysia application instance
 * @returns {Elysia} Configured auth routes
 */
export const authRoutes = (app: Elysia) => {
  const controller = new AuthController();

  return app.group('/auth', app => app
    /**
     * Global error handler for auth routes
     */
    .onError(({ error }) => {
      console.error('Auth route error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    })

    /**
     * JWT middleware configuration
     */
    .use(jwt({
      name: 'jwt',
      secret: config.JWT_ACCESS_SECRET,
      exp: '24h'
    }))

    /**
     * Login endpoint
     * @param {Object} params - Request parameters
     * @param {Object} params.jwt - JWT utilities
     * @param {Object} params.body - Request body
     * @param {Object} params.cookie - Cookie utilities
     * @returns {Object} Login response
     */
    .post('/login', async ({ jwt, body, cookie: { auth } }) => {
      const validatedBody = LoginRequestDTO.parse(body);
      const result = await controller.login(validatedBody);

      const token = await jwt.sign({
        userId: result.id,
        email: result.email,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      });

      auth.set({
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? 'your-domain.com' : undefined
      });

      return { message: 'Login successful' };
    }, {
      detail: {
        tags: ['auth']
      },
      body: t.Object({
        email: t.String(),
        password: t.String()
      })
    })

    /**
     * Registration endpoint
     * @param {Object} params - Request parameters
     * @param {Object} params.jwt - JWT utilities
     * @param {Object} params.body - Request body
     * @param {Object} params.cookie - Cookie utilities
     * @returns {Object} Registration response
     */
    .post('/register', async ({ jwt, body, cookie: { auth } }) => {
      const validatedBody = RegisterRequestDTO.parse(body);
      const result = await controller.register(validatedBody);

      const token = await jwt.sign({
        userId: result.id,
        email: result.email,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      });

      auth.set({
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? 'your-domain.com' : undefined
      });

      return { message: 'Registration successful' };
    }, {
      detail: {
        tags: ['auth']
      },
      body: t.Object({
        email: t.String(),
        password: t.String(),
        name: t.String()
      })
    })

    /**
     * Logout endpoint
     * @param {Object} params - Request parameters
     * @param {Object} params.cookie - Cookie utilities
     * @returns {Object} Logout response
     */
    .post('/logout', ({ cookie: { auth } }) => {
      auth.remove();
      return { message: 'Logged out successfully' };
    }, {
      detail: {
        tags: ['auth']
      }
    })
  );
};

export default authRoutes;
