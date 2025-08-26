import { Practitioner } from '../../data/datatypes/fhirPractitioner';
import { PractitionerRepository } from '../../data/repositories/fhir/practitionerRepository';

export class PractitionerService {
  private practitionerRepository: PractitionerRepository;

  constructor() {
    this.practitionerRepository = new PractitionerRepository();
  }

  async getAllPractitioners(): Promise<Practitioner[]> {
    try {
      const practitioners = await this.practitionerRepository.getPractitioners();
      
      if (!practitioners || practitioners.length === 0) {
        console.log('No practitioners found in FHIR server');
        return [];
      }

      console.log(`Retrieved ${practitioners.length} practitioners from FHIR server`);
      return practitioners;
    } catch (error) {
      console.error('Error in practitioner service:', error);
      throw error;
    }
  }

  async getPractitionerById(id: string): Promise<Practitioner | null> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Practitioner ID is required');
      }

      const practitioner = await this.practitionerRepository.getPractitionerById(id);
      return practitioner;
    } catch (error) {
      console.error('Error in practitioner service:', error);
      throw error;
    }
  }

  async createPractitioner(practitionerData: Practitioner): Promise<Practitioner> {
    try {
      if (!practitionerData.resourceType || practitionerData.resourceType !== 'Practitioner') {
        throw new Error('Invalid resource type. Must be "Practitioner"');
      }

      const createdPractitioner = await this.practitionerRepository.createPractitioner(practitionerData);
      
      console.log(`Successfully created practitioner with ID: ${createdPractitioner.id}`);
      return createdPractitioner;
    } catch (error) {
      console.error('Error in practitioner service:', error);
      throw error;
    }
  }
}
