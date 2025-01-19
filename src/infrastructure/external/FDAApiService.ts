// src/infrastructure/external/FDAApiService.ts
import { z } from 'zod';
import { Medication } from '@/domain/entities/Medication';
import { IMedicationRepository, MedicationFilters } from '@/domain/repositories/IMedicationRepository';

/**
 * Schema for validating FDA API responses
 * @remarks Export the schema so we can mock it in tests
 */
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
 * @class
 */
export class FDAApiService implements IMedicationRepository {
  private static readonly MAX_SKIP_LIMIT = 5000; // FDA API limitation
  private static readonly MAX_PAGES = Math.floor(FDAApiService.MAX_SKIP_LIMIT / 10); // Assuming default limit is 10

  /**
   * Creates an instance of FDAApiService
   * @constructor
   * @param {string} apiKey - API key for FDA API authentication
   */
  constructor(private readonly apiKey: string) { }

  /**
   * Returns the maximum number of pages for a given limit
   * @param {number} limit - Results per page
   * @returns {number} Maximum number of pages
   */
  public getMaxPages(limit: number): number {
    return Math.floor(FDAApiService.MAX_SKIP_LIMIT / limit);
  }

  /**
   * Translates filter parameters to FDA API search syntax
   * @private
   * @param {MedicationFilters} filters - Application filters
   * @returns {string} FDA API compatible search query
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
   * @private
   * @param {string} term - Raw search term
   * @param {boolean} [isProductId=false] - Whether the term is a product ID
   * @returns {string} Sanitized term
   */
  private sanitizeSearchTerm(term: string, isProductId: boolean = false): string {
    if (isProductId) {
      // For product IDs, only trim and add wildcards
      const cleanTerm = term.trim();
      return `*${cleanTerm}*`;
    }

    // For other terms, apply the normal sanitization
    const cleanTerm = term
      .trim()
      .toLowerCase()
      // Replace any non-alphanumeric characters (except spaces) with empty string
      .replace(/[^a-z0-9\s]/g, '')
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ');

    return `*${cleanTerm}*`;
  }

  /**
   * Creates FDA API URL with proper parameters
   * @private
   * @param {string} searchQuery - Translated search query
   * @param {number} limit - Results per page
   * @param {number} skip - Number of results to skip
   * @returns {string} Complete FDA API URL
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
   * @async
   * @param {MedicationFilters} filters - Filters for medication search
   * @returns {Promise<{medications: Medication[], total: number}>} Medications and total count
   * @throws {Error} When FDA API request fails
   */
  async findMedications(filters: MedicationFilters) {
    return new Promise<{
      medications: Medication[], total: number,
      maxPages: number
    }>((resolve, reject) => {
      const searchQuery = this.translateToFDAQuery(filters);
      const skip = (filters.page - 1) * filters.limit;
      const maxPages = this.getMaxPages(filters.limit);

      // Check if requested page exceeds max pages
      if (filters.page > maxPages) {
        resolve({
          medications: [],
          total: FDAApiService.MAX_SKIP_LIMIT,
          maxPages
        });
        return;
      }

      const apiUrl = this.createFDAApiUrl(searchQuery, filters.limit, skip);

      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            if (response.status === 400) {
              return resolve({
                medications: [],
                total: FDAApiService.MAX_SKIP_LIMIT,
                maxPages
              });
            }
            throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          const validated = fdaResponseSchema.parse(data);
          const total = Math.min(validated.meta.results.total, FDAApiService.MAX_SKIP_LIMIT);

          resolve({
            medications: validated.results.map(this.mapToMedication),
            total,
            maxPages
          });
        })
        .catch(error => {
          reject(new Error(`FDA API error: ${error.message}`));
        });
    });
  }

  /**
   * Finds a medication by its ID
   * @async
   * @param {string} id - Medication ID to search for
   * @returns {Promise<Medication | null>} Found medication or null if not found
   * @throws {Error} When FDA API request fails
   */
  async findById(id: string): Promise<Medication | null> {
    return new Promise<Medication | null>((resolve, reject) => {
      const sanitizedId = this.sanitizeSearchTerm(id, true); // Add true for product ID
      const searchQuery = `product_id:${sanitizedId}`;
      const apiUrl = this.createFDAApiUrl(searchQuery, 1, 0);

      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`FDA API error: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          const validated = fdaResponseSchema.parse(data);
          if (validated.results.length === 0) {
            resolve(null);
          } else {
            resolve(this.mapToMedication(validated.results[0]));
          }
        })
        .catch(error => {
          reject(new Error(`FDA API error: ${error.message}`));
        });
    });
  }

  /**
   * Maps FDA API response data to Medication domain model
   * @private
   * @param {any} data - Raw FDA API response data
   * @returns {Medication} Mapped medication entity
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
