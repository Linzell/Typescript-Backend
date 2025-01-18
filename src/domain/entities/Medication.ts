// src/domain/entities/Medication.ts

/**
 * Represents an active ingredient in a medication
 * @interface ActiveIngredient
 */
export type ActiveIngredient = {
  /** The name of the active ingredient */
  name: string;
  /** The strength/dosage of the active ingredient */
  strength: string;
};

/**
 * Represents packaging information for a medication
 * @interface Packaging
 */
export type Packaging = {
  /** Description of the packaging */
  description: string;
  /** Date when marketing started */
  marketingStartDate?: string;
  /** Date when marketing ended */
  marketingEndDate?: string;
};

/**
 * Represents a medication with its properties and behaviors
 * @class Medication
 */
export class Medication {
  /**
   * Creates an instance of Medication
   * @param {string} id - Unique identifier for the medication
   * @param {string} brandName - Brand name of the medication
   * @param {string} genericName - Generic name of the medication
   * @param {string} labelerName - Name of the manufacturer/labeler
   * @param {ActiveIngredient[]} activeIngredients - List of active ingredients
   * @param {string[]} routes - List of administration routes
   * @param {Packaging[]} packaging - List of packaging information
   */
  constructor(
    public readonly id: string,
    public readonly brandName: string,
    public readonly genericName: string,
    public readonly labelerName: string,
    public readonly activeIngredients: ActiveIngredient[],
    public readonly routes: string[],
    public readonly packaging: Packaging[]
  ) { }

  /**
   * Creates a new Medication instance from provided properties
   * @param {Object} props - Properties to create the medication
   * @returns {Medication} A new Medication instance
   */
  static create(props: {
    id: string;
    brandName: string;
    genericName: string;
    labelerName: string;
    activeIngredients: ActiveIngredient[];
    routes: string[];
    packaging: Packaging[];
  }): Medication {
    return new Medication(
      props.id,
      props.brandName,
      props.genericName,
      props.labelerName,
      props.activeIngredients,
      props.routes,
      props.packaging
    );
  }

  /**
   * Converts packaging information to an array of description strings
   * @returns {string[]} Array of packaging descriptions
   */
  getPackagingStrings(): string[] {
    return this.packaging.map(pkg => pkg.description);
  }

  /**
   * Gets the primary administration route
   * @returns {string} Primary route or empty string if no routes exist
   */
  getPrimaryRoute(): string {
    return this.routes[0] || '';
  }
}
