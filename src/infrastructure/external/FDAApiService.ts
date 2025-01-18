// src/infrastructure/external/FDAApiService.ts
import { z } from 'zod';
import { Medication } from '@/domain/entities/Medication';
import { IMedicationRepository, MedicationFilters } from '@/domain/repositories/IMedicationRepository';

// Export the schema so we can mock it in tests
export const fdaResponseSchema = z.object({
  meta: z.object({
    disclaimer: z.string(),
    terms: z.string(),
    license: z.string(),
    last_updated: z.string(),
    results: z.object({
      skip: z.number(),
      limit: z.number(),
      total: z.number(),
    }),
  }),
  results: z.array(z.object({
    product_ndc: z.string(),
    generic_name: z.string(),
    labeler_name: z.string(),
    brand_name: z.string().optional().nullable(),
    active_ingredients: z.array(z.unknown()),
    finished: z.boolean(),
    packaging: z.array(z.unknown()),
    listing_expiration_date: z.string().optional(),
    marketing_category: z.string(),
    dosage_form: z.string(),
    spl_id: z.string(),
    product_type: z.string(),
    marketing_start_date: z.string(),
    marketing_end_date: z.string().optional(),
    product_id: z.string(),
    application_number: z.string().optional(),
    brand_name_base: z.string().nullable(),
    route: z.array(z.string()).optional(),
    pharm_class: z.array(z.string()).optional(),
    openfda: z.unknown(),
  })),
});

/**
 * Service for interacting with the FDA API
 * @implements {IMedicationRepository}
 */
export class FDAApiService implements IMedicationRepository {
  /**
   * Creates an instance of FDAApiService
   * @param {string} apiKey - API key for FDA API authentication
   */
  constructor(private readonly apiKey: string) { }

  /**
   * Finds medications based on provided filters
   * @param {MedicationFilters} filters - Filters for medication search
   * @returns {Promise<{medications: Medication[], total: number}>} Medications and total count
   * @throws {Error} When FDA API request fails
   */
  async findMedications(filters: MedicationFilters) {
    const searchTerms: string[] = [];

    if (filters.activeIngredient) {
      searchTerms.push(`active_ingredients.name:"${filters.activeIngredient}"`);
    }

    if (filters.route) {
      searchTerms.push(`route:"${filters.route}"`);
    }

    const searchQuery = searchTerms.length > 0
      ? searchTerms.join(' AND ')
      : '*';

    const skip = (filters.page - 1) * filters.limit;

    const response = await fetch(
      `https://api.fda.gov/drug/ndc.json?api_key=${this.apiKey}&search=${searchQuery}&limit=${filters.limit}&skip=${skip}`
    );

    if (!response.ok) {
      throw new Error(`FDA API error: ${response.statusText}`);
    }

    const data = await response.json();
    const validated = fdaResponseSchema.parse(data);

    return {
      medications: validated.results.map(this.mapToMedication),
      total: validated.meta.results.total,
    };
  }

  /**
   * Finds a medication by its ID
   * @param {string} id - Medication ID to search for
   * @returns {Promise<Medication | null>} Found medication or null if not found
   * @throws {Error} When FDA API request fails
   */
  async findById(id: string): Promise<Medication | null> {
    const response = await fetch(
      `https://api.fda.gov/drug/ndc.json?api_key=${this.apiKey}&search=product_id:${id}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`FDA API error: ${response.statusText}`);
    }

    const data = await response.json();
    const validated = fdaResponseSchema.parse(data);

    if (validated.results.length === 0) {
      return null;
    }

    return this.mapToMedication(validated.results[0]);
  }

  /**
   * Maps FDA API response data to Medication domain model
   * @param {any} data - Raw FDA API response data
   * @returns {Medication} Mapped medication entity
   * @private
   */
  private mapToMedication(data: any): Medication {
    return new Medication(
      data.product_id,
      data.brand_name,
      data.generic_name,
      data.labeler_name,
      data.active_ingredients,
      data.route,
      data.packaging
    );
  }
}
