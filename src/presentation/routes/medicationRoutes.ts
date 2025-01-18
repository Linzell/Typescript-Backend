/**
 * @file Medication routes configuration file
 * @description Defines API routes for medication-related endpoints with JWT authentication
 */

import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { record } from '@elysiajs/opentelemetry';
import { MedicationController } from '@/application/controllers/MedicationController';
import { MedicationService } from '@/domain/services/MedicationService';
import { FDAApiService } from '@/infrastructure/external/FDAApiService';
import { MedicationFilterDTO } from '@/application/dtos/MedicationDTO';

import { config } from '@/config';

/**
 * Configure medication routes with authentication and error handling
 * @param app - Elysia application instance
 * @returns Configured Elysia app with medication routes
 */
const medicationRoutes = (app: Elysia) => {
  const fdaApiService = new FDAApiService(process.env.FDA_API_KEY!);
  const medicationService = new MedicationService(fdaApiService);
  const medicationController = new MedicationController(medicationService);

  return app.group('/medications', app => app
    /**
     * Global error handler for medication routes
     */
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

    /**
     * JWT authentication middleware configuration
     */
    .use(jwt({
      name: 'jwt',
      secret: config.JWT_ACCESS_SECRET,
      exp: '24h'
    }))

    /**
     * Authentication verification middleware
     */
    .onBeforeHandle(({ jwt, cookie: { auth }, set }) => {
      if (!auth?.value) {
        set.status = 401;
        return 'No authentication token provided';
      }

      return jwt.verify(auth.value)
        .then(profile => {
          if (!profile) {
            set.status = 401;
            return 'Invalid authentication token';
          }
        })
        .catch(() => {
          set.status = 401;
          return 'Invalid authentication token';
        });
    })

    /**
     * Get paginated list of medications with optional filters
     * @param query - Query parameters for filtering and pagination
     * @returns Paginated list of medications
     */
    .get('/', async ({ query }) => {
      return record('getMedicationsList', async () => {
        const filters = MedicationFilterDTO.parse({
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 9,
          activeIngredient: query.activeIngredient,
          route: query.route,
          name: query.name
        });

        return medicationController.getMedications(filters)
          .then(result => new Response(
            JSON.stringify(result),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          ));
      });
    }, {
      detail: {
        tags: ['medications']
      },
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        activeIngredient: t.Optional(t.String()),
        route: t.Optional(t.String()),
        name: t.Optional(t.String())
      })
    })

    /**
     * Get medication details by ID
     * @param id - Medication identifier
     * @returns Detailed medication information
     */
    .get('/:id', async ({ params: { id } }) => {
      return record('getMedicationById', async () => {
        return medicationController.getMedicationById(id)
          .then(result => new Response(
            JSON.stringify(result),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          ));
      });
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
