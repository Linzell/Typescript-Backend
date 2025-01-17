// src/domain/repositories/IMedicationRepository.test.ts
import { describe, expect, it } from 'bun:test';
import { MockMedicationRepository } from './__mocks__/MockMedicationRepository';

describe('IMedicationRepository', () => {
  const repository = new MockMedicationRepository();

  describe('findMedications', () => {
    it('should return paginated medications without filters', async () => {
      const result = await repository.findMedications({
        page: 1,
        limit: 10
      });

      expect(result.medications.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should filter by active ingredient', async () => {
      const result = await repository.findMedications({
        activeIngredient: 'ibuprofen',
        page: 1,
        limit: 10
      });

      expect(result.medications.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.medications[0].brandName).toBe('Advil');
    });

    it('should filter by route', async () => {
      const result = await repository.findMedications({
        route: 'ORAL',
        page: 1,
        limit: 10
      });

      expect(result.medications.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should handle pagination correctly', async () => {
      const result = await repository.findMedications({
        page: 1,
        limit: 1
      });

      expect(result.medications.length).toBe(1);
      expect(result.total).toBe(2);
    });

    it('should return empty array when page is out of bounds', async () => {
      const result = await repository.findMedications({
        page: 3,
        limit: 1
      });

      expect(result.medications.length).toBe(0);
      expect(result.total).toBe(2);
    });
  });

  describe('findById', () => {
    it('should return medication when found', async () => {
      const medication = await repository.findById('1');

      expect(medication).not.toBeNull();
      expect(medication?.brandName).toBe('Advil');
    });

    it('should return null when medication is not found', async () => {
      const medication = await repository.findById('999');

      expect(medication).toBeNull();
    });
  });
});
