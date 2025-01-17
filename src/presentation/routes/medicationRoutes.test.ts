// src/presentation/routes/medicationRoutes.test.ts

import { describe, expect, it, beforeEach, mock } from "bun:test";
import { Elysia } from 'elysia';
import medicationRoutes from './medicationRoutes';
import jwt from "@elysiajs/jwt";
import { config } from '@/config';

describe('medicationRoutes', () => {
  let app: Elysia;
  let mockMedicationController: {
    getMedications: ReturnType<typeof mock>;
    getMedicationById: ReturnType<typeof mock>;
  };

  const mockMedicationData = {
    results: [
      {
        id: '1',
        brand_name: 'Test Med',
        generic_name: 'Test Generic',
        labeler_name: 'Test Lab',
        active_ingredients: [
          { name: 'Ingredient 1', strength: '10mg' }
        ],
        route: ['ORAL']
      }
    ],
    total: 1,
    skip: 0,
    limit: 10
  };

  const mockMedicationDetail = {
    id: '1',
    brand_name: 'Test Med',
    generic_name: 'Test Generic',
    labeler_name: 'Test Lab',
    active_ingredients: [
      { name: 'Ingredient 1', strength: '10mg' }
    ],
    route: ['ORAL'],
    packaging: [
      { package_ndc: '12345-678-90', description: 'bottle of 30 tablets' }
    ]
  };

  beforeEach(() => {
    app = new Elysia()
      .decorate('jwt', {
        sign: mock(() => Promise.resolve('mock.jwt.token')),
        verify: mock(() => Promise.resolve({ userId: '123' }))
      })
      .decorate('cookie', {
        auth: {
          set: mock(() => { }),
          remove: mock(() => { })
        }
      });

    // Create mocks for controller methods
    mockMedicationController = {
      getMedications: mock(() => Promise.resolve(mockMedicationData)),
      getMedicationById: mock(() => Promise.resolve(mockMedicationDetail))
    };

    // Mock the entire controller
    mock.module('@/application/controllers/MedicationController', () => ({
      MedicationController: class {
        constructor() {
          return mockMedicationController;
        }
      }
    }));

    // Mock the services
    mock.module('@/domain/services/MedicationService', () => ({
      MedicationService: class { }
    }));

    mock.module('@/infrastructure/external/FDAApiService', () => ({
      FDAApiService: class { }
    }));

    app.use(jwt({
      name: 'jwt',
      secret: config.JWT_ACCESS_SECRET
    }));

    medicationRoutes(app);
  });

  describe('GET /medications', () => {
    it('should return a list of medications with default pagination', async () => {
      const response = await app.handle(
        new Request('http://localhost/medications', {
          headers: {
            'Cookie': 'auth=valid-token'
          }
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockMedicationData);
      expect(mockMedicationController.getMedications).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        activeIngredient: undefined,
        route: undefined
      });
    });

    it('should handle custom pagination and filters', async () => {
      const response = await app.handle(
        new Request('http://localhost/medications?page=2&limit=20&activeIngredient=Ibuprofen&route=ORAL', {
          headers: {
            'Cookie': 'auth=valid-token'
          }
        })
      );

      expect(response.status).toBe(200);
      expect(mockMedicationController.getMedications).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        activeIngredient: 'Ibuprofen',
        route: 'ORAL'
      });
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await app.handle(
        new Request('http://localhost/medications?page=invalid&limit=invalid', {
          headers: {
            'Cookie': 'auth=valid-token'
          }
        })
      );

      expect(response.status).toBe(200);
      expect(mockMedicationController.getMedications).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        activeIngredient: undefined,
        route: undefined
      });
    });

    it('should return 401 when no auth token provided', async () => {
      const mockVerify = mock(() => Promise.resolve(null));
      app.decorators.jwt.verify = mockVerify;

      const response = await app.handle(
        new Request('http://localhost/medications')
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /medications/:id', () => {
    it('should return medication details for valid ID', async () => {
      const response = await app.handle(
        new Request('http://localhost/medications/1', {
          headers: {
            'Cookie': 'auth=valid-token'
          }
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockMedicationDetail);
      expect(mockMedicationController.getMedicationById).toHaveBeenCalledWith('1');
    });

    it('should handle non-existent medication ID', async () => {
      mockMedicationController.getMedicationById = mock(() =>
        Promise.reject(new Error('Medication not found'))
      );

      const response = await app.handle(
        new Request('http://localhost/medications/999', {
          headers: {
            'Cookie': 'auth=valid-token'
          }
        })
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Internal Server Error' });
    });

    it('should return 401 when no auth token provided', async () => {
      const response = await app.handle(
        new Request('http://localhost/medications/1')
      );

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle internal server errors', async () => {
      mockMedicationController.getMedications = mock(() =>
        Promise.reject(new Error('Database error'))
      );

      const response = await app.handle(
        new Request('http://localhost/medications', {
          headers: {
            'Cookie': 'auth=valid-token'
          }
        })
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Internal Server Error' });
    });
  });
});
