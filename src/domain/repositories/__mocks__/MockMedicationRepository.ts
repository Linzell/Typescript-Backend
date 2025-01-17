// src/domain/repositories/__mocks__/MockMedicationRepository.ts
import { Medication } from '@/domain/entities/Medication';
import { IMedicationRepository, MedicationFilters } from '../IMedicationRepository';

export class MockMedicationRepository implements IMedicationRepository {
  private medications: Medication[] = [
    Medication.create({
      id: '1',
      brandName: 'Advil',
      genericName: 'Ibuprofen',
      labelerName: 'Pfizer',
      activeIngredients: [
        { name: 'Ibuprofen', strength: '200mg' }
      ],
      routes: ['ORAL'],
      packaging: [
        { description: '100 tablets per bottle' }
      ]
    }),
    Medication.create({
      id: '2',
      brandName: 'Tylenol',
      genericName: 'Acetaminophen',
      labelerName: 'Johnson & Johnson',
      activeIngredients: [
        { name: 'Acetaminophen', strength: '500mg' }
      ],
      routes: ['ORAL'],
      packaging: [
        { description: '50 tablets per bottle' }
      ]
    })
  ];

  async findMedications(filters: MedicationFilters) {
    let filteredMeds = [...this.medications];

    if (filters.activeIngredient) {
      filteredMeds = filteredMeds.filter(med =>
        med.activeIngredients.some(ing =>
          ing.name.toLowerCase().includes(filters.activeIngredient!.toLowerCase())
        )
      );
    }

    if (filters.route) {
      filteredMeds = filteredMeds.filter(med =>
        med.routes.some(route =>
          route.toLowerCase() === filters.route!.toLowerCase()
        )
      );
    }

    const start = (filters.page - 1) * filters.limit;
    const paginatedMeds = filteredMeds.slice(start, start + filters.limit);

    return {
      medications: paginatedMeds,
      total: filteredMeds.length
    };
  }

  async findById(id: string) {
    return this.medications.find(med => med.id === id) || null;
  }
}
