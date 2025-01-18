// src/infrastructure/external/FDAApiService.test.ts
import { describe, it, expect, beforeEach } from "bun:test";
import { FDAApiService, fdaResponseSchema } from './FDAApiService';
import { MedicationFilters } from '@/domain/repositories/IMedicationRepository';
import { mock, spyOn } from 'bun:test';

describe('FDAApiService', () => {
  let service: FDAApiService;
  const mockApiKey = 'test-api-key';

  const createMockResponse = (data: any) => {
    return new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });
  };

  beforeEach(() => {
    service = new FDAApiService(mockApiKey);
    global.fetch = mock(() =>
      Promise.resolve(createMockResponse({}))
    );
  });

  describe('findMedications', () => {
    it('should fetch medications with correct filters', async () => {
      const mockResponse = {
        meta: {
          disclaimer: "Test disclaimer",
          terms: "Test terms",
          license: "Test license",
          last_updated: "2024-01-01",
          results: {
            skip: 0,
            limit: 1,
            total: 1
          }
        },
        results: [{
          product_id: '1',
          product_ndc: '123',
          brand_name: 'Test Med',
          generic_name: 'Test Generic',
          labeler_name: 'Test Lab',
          active_ingredients: [{ name: 'Test Ingredient', strength: '10mg' }],
          route: ['ORAL'],
          packaging: [{
            description: 'bottle',
            marketing_start_date: '20240101',
            sample: false,
          }],
          finished: true,
          marketing_category: 'Test Category',
          dosage_form: 'Test Form',
          spl_id: 'test-spl',
          product_type: 'Test Type',
          marketing_start_date: '20240101',
        }],
      };

      // Mock fetch
      global.fetch = mock(() =>
        Promise.resolve(createMockResponse(mockResponse))
      );

      // Mock schema validation
      const parseSpy = spyOn(fdaResponseSchema, 'parse');
      parseSpy.mockImplementation(() => mockResponse);

      const filters: MedicationFilters = {
        page: 1,
        limit: 10,
        activeIngredient: 'Test',
        route: 'ORAL',
      };

      const result = await service.findMedications(filters);

      expect(result.medications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api_key=test-api-key')
      );
    });

    it('should throw error on invalid API response', async () => {
      const invalidResponse = { invalid: 'response' };

      global.fetch = mock(() =>
        Promise.resolve(createMockResponse(invalidResponse))
      );

      const parseSpy = spyOn(fdaResponseSchema, 'parse');
      parseSpy.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const filters: MedicationFilters = {
        page: 1,
        limit: 10,
      };

      expect(service.findMedications(filters)).rejects.toThrow();
    });

    it('should handle API error responses', async () => {
      global.fetch = mock(() =>
        Promise.resolve(new Response('', {
          status: 400,
          statusText: 'Bad Request',
        }))
      );

      const filters: MedicationFilters = {
        page: 1,
        limit: 10,
      };

      expect(service.findMedications(filters)).rejects.toThrow('FDA API error');
    });
  });

  describe('findById', () => {
    it('should fetch medication by id', async () => {
      const mockResponse = {
        meta: {
          disclaimer: "Test disclaimer",
          terms: "Test terms",
          license: "Test license",
          last_updated: "2024-01-01",
          results: {
            skip: 0,
            limit: 1,
            total: 1
          }
        },
        results: [{
          product_id: '1',
          product_ndc: '123',
          brand_name: 'Test Med',
          generic_name: 'Test Generic',
          labeler_name: 'Test Lab',
          active_ingredients: [{ name: 'Test Ingredient', strength: '10mg' }],
          route: ['ORAL'],
          packaging: [{
            description: 'bottle',
            marketing_start_date: '20240101',
            sample: false,
          }],
          finished: true,
          marketing_category: 'Test Category',
          dosage_form: 'Test Form',
          spl_id: 'test-spl',
          product_type: 'Test Type',
          marketing_start_date: '20240101',
        }],
      };

      global.fetch = mock(() =>
        Promise.resolve(createMockResponse(mockResponse))
      );

      const parseSpy = spyOn(fdaResponseSchema, 'parse');
      parseSpy.mockImplementation(() => mockResponse);

      const result = await service.findById('1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
    });

    it('should return null when medication is not found', async () => {
      const mockResponse = {
        meta: {
          disclaimer: "Test disclaimer",
          terms: "Test terms",
          license: "Test license",
          last_updated: "2024-01-01",
          results: {
            skip: 0,
            limit: 0,
            total: 0
          }
        },
        results: [],
      };

      global.fetch = mock(() =>
        Promise.resolve(createMockResponse(mockResponse))
      );

      const parseSpy = spyOn(fdaResponseSchema, 'parse');
      parseSpy.mockImplementation(() => mockResponse);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
