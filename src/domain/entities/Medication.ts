// src/domain/entities/Medication.ts
export type ActiveIngredient = {
  name: string;
  strength: string;
};

export type Packaging = {
  description: string;
  marketingStartDate?: string;
  marketingEndDate?: string;
};

export class Medication {
  constructor(
    public readonly id: string,
    public readonly brandName: string,
    public readonly genericName: string,
    public readonly labelerName: string,
    public readonly activeIngredients: ActiveIngredient[],
    public readonly routes: string[],  // Note: changed from route to routes as it's an array
    public readonly packaging: Packaging[]
  ) { }

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

  // Method to transform packaging to string array
  getPackagingStrings(): string[] {
    return this.packaging.map(pkg => pkg.description);
  }

  // Method to get primary route
  getPrimaryRoute(): string {
    return this.routes[0] || '';
  }
}
