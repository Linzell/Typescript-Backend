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
   * Translates filter parameters to FDA API search syntax
   * @param {MedicationFilters} filters - Application filters
   * @returns {string} FDA API compatible search query
   * @private
   */
  private translateToFDAQuery(filters: MedicationFilters): string {
    const searchTerms: string[] = [];

    if (filters.name) {
      const sanitizedName = this.sanitizeSearchTerm(filters.name);
      // Use proper FDA syntax for field queries
      searchTerms.push(
        `(brand_name="${sanitizedName}"+OR+generic_name="${sanitizedName}")`
      );
    }

    if (filters.activeIngredient) {
      const sanitizedIngredient = this.sanitizeSearchTerm(filters.activeIngredient);
      searchTerms.push(`active_ingredients.name="${sanitizedIngredient}"`);
    }

    if (filters.route) {
      const sanitizedRoute = this.sanitizeSearchTerm(filters.route);
      searchTerms.push(`route="${sanitizedRoute}"`);
    }

    return searchTerms.length > 0
      ? searchTerms.join('+AND+')
      : '*';
  }

  /**
   * Sanitizes search terms for FDA API syntax
   * @param {string} term - Raw search term
   * @returns {string} Sanitized term
   * @private
   */
  private sanitizeSearchTerm(term: string): string {
    const cleanTerm = term
      .trim()
      .toLowerCase()
      // Replace any non-alphanumeric characters (except spaces) with empty string
      .replace(/[^a-z0-9\s]/g, '')
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ');

    // Return the term with wildcards
    return `*${cleanTerm}*`;
  }

  /**
   * Creates FDA API URL with proper parameters
   * @param {string} searchQuery - Translated search query
   * @param {number} limit - Results per page
   * @param {number} skip - Number of results to skip
   * @returns {string} Complete FDA API URL
   * @private
   */
  private createFDAApiUrl(searchQuery: string, limit: number, skip: number): string {
    // Base URL
    const baseUrl = 'https://api.fda.gov/drug/ndc.json';

    // Create params without URLSearchParams to have more control over encoding
    const params = [
      `api_key=${this.apiKey}`,
      `search=${encodeURIComponent(searchQuery)}`,
      `limit=${limit}`,
      `skip=${skip}`
    ];

    return `${baseUrl}?${params.join('&')}`;
  }

  /**
   * Finds medications based on provided filters
   * @param {MedicationFilters} filters - Filters for medication search
   * @returns {Promise<{medications: Medication[], total: number}>} Medications and total count
   * @throws {Error} When FDA API request fails
   */
  async findMedications(filters: MedicationFilters) {
    try {
      const searchQuery = this.translateToFDAQuery(filters);
      const skip = (filters.page - 1) * filters.limit;
      const apiUrl = this.createFDAApiUrl(searchQuery, filters.limit, skip);

      console.log('FDA API Request URL (decoded):', decodeURIComponent(apiUrl)); // For debugging

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('FDA API Response:', errorBody); // For debugging
        throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const validated = fdaResponseSchema.parse(data);

      return {
        medications: validated.results.map(this.mapToMedication),
        total: validated.meta.results.total,
      };
    } catch (error) {
      console.error('FDA API Error:', error);
      throw new Error(`Failed to fetch medications: ${error.message}`);
    }
  }

  /**
   * Finds a medication by its ID
   * @param {string} id - Medication ID to search for
   * @returns {Promise<Medication | null>} Found medication or null if not found
   * @throws {Error} When FDA API request fails
   */
  async findById(id: string): Promise<Medication | null> {
    const sanitizedId = this.sanitizeSearchTerm(id);
    const searchQuery = `product_id:${sanitizedId}`;

    const apiUrl = this.createFDAApiUrl(searchQuery, 1, 0);

    const response = await fetch(apiUrl);

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
