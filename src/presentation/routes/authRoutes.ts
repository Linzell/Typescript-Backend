// src/presentation/routes/authRoutes.ts
import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { AuthController } from '@/application/controllers/AuthController';
import {
  LoginRequestDTO,
  RegisterRequestDTO
} from '@/application/dtos/AuthDTO';

import { config } from '@/config';

export const authRoutes = (app: Elysia) => {
  const controller = new AuthController();

  return app.group('/auth', app => app
    .onError(({ error }) => {
      console.error('Auth route error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    })

    .use(jwt({
      name: 'jwt',
      secret: config.JWT_ACCESS_SECRET,
      exp: '24h'
    }))

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
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
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
        sameSite: 'strict',
        maxAge: 24 * 60 * 60,
        path: '/'
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
