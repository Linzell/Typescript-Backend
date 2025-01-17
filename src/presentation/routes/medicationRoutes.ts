// src/presentation/routes/medicationRoutes.ts
import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { MedicationController } from '@/application/controllers/MedicationController';
import { MedicationService } from '@/domain/services/MedicationService';
import { FDAApiService } from '@/infrastructure/external/FDAApiService';
import { MedicationFilterDTO } from '@/application/dtos/MedicationDTO';

import { config } from '@/config';

const medicationRoutes = (app: Elysia) => {
  const fdaApiService = new FDAApiService(process.env.FDA_API_KEY!);
  const medicationService = new MedicationService(fdaApiService);
  const medicationController = new MedicationController(medicationService);

  return app.group('/medications', app => app
    .onError(({ error }) => {
      // Only log errors in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        console.error('Medication route error:', error);
      }
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

    .get('/', async ({ jwt, query, set, cookie: { auth } }) => {
      const profile = await jwt.verify(auth.value)

      if (!profile) {
        set.status = 401
        return 'Unauthorized'
      }

      const filters = MedicationFilterDTO.parse({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        activeIngredient: query.activeIngredient,
        route: query.route
      });

      return medicationController.getMedications(filters)
        .then(result => new Response(
          JSON.stringify(result),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        ));
    }, {
      detail: {
        tags: ['medications']
      },
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        activeIngredient: t.Optional(t.String()),
        route: t.Optional(t.String())
      })
    })

    .get('/:id', async ({ jwt, params: { id }, set, cookie: { auth } }) => {
      const profile = await jwt.verify(auth.value)

      if (!profile) {
        set.status = 401
        return 'Unauthorized'
      }

      return medicationController.getMedicationById(id)
        .then(result => new Response(
          JSON.stringify(result),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        ));
    }, {
      detail: {
        tags: ['medications']
      },
      params: t.Object({
        id: t.String()
      })
    })
  );
};

export default medicationRoutes;
