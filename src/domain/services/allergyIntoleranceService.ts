import { AllergyIntolerance } from '../../data/datatypes/fhirAllergyIntolerance';
import { AllergyIntoleranceRepository } from '../../data/repositories/fhir/allergyIntoleranceRepository';
import { UserRepository } from '../../data/repositories/fhir/patientRepository';

export class AllergyIntoleranceService {
  private allergyIntoleranceRepository: AllergyIntoleranceRepository;
  private userRepository: UserRepository;

  constructor() {
    this.allergyIntoleranceRepository = new AllergyIntoleranceRepository();
    this.userRepository = new UserRepository();
  }

  async getAllAllergyIntolerances(): Promise<AllergyIntolerance[]> {
    try {
      const allergyIntolerances = await this.allergyIntoleranceRepository.getAllergyIntolerances();
      
      if (!allergyIntolerances || allergyIntolerances.length === 0) {
        console.log('No allergy intolerances found in FHIR server');
        return [];
      }

      console.log(`Retrieved ${allergyIntolerances.length} allergy intolerances from FHIR server`);
      return allergyIntolerances;
    } catch (error) {
      console.error('Error in allergy intolerance service:', error);
      throw error;
    }
  }

  async getAllergyIntoleranceById(id: string): Promise<AllergyIntolerance | null> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Allergy intolerance ID is required');
      }

      const allergyIntolerance = await this.allergyIntoleranceRepository.getAllergyIntoleranceById(id);
      return allergyIntolerance;
    } catch (error) {
      console.error('Error in allergy intolerance service:', error);
      throw error;
    }
  }

  async createAllergyIntolerance(allergyIntoleranceData: AllergyIntolerance): Promise<AllergyIntolerance> {
    try {
      if (!allergyIntoleranceData.resourceType || allergyIntoleranceData.resourceType !== 'AllergyIntolerance') {
        throw new Error('Invalid resource type. Must be "AllergyIntolerance"');
      }

      // Validate that the patient exists
      if (!allergyIntoleranceData.patient || !allergyIntoleranceData.patient.reference) {
        throw new Error('Allergy intolerance must have a valid patient reference');
      }

      // Extract patient ID from reference (e.g., "Patient/123" -> "123")
      const patientReference = allergyIntoleranceData.patient.reference;
      const patientId = patientReference.replace('Patient/', '');
      
      if (!patientId) {
        throw new Error('Invalid patient reference format');
      }

      // Check if the patient exists
      const patient = await this.userRepository.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      // Remove ID if provided (FHIR server will assign one)
      const allergyIntoleranceToCreate = { ...allergyIntoleranceData };
      delete allergyIntoleranceToCreate.id;

      const createdAllergyIntolerance = await this.allergyIntoleranceRepository.createAllergyIntolerance(allergyIntoleranceToCreate);
      
      console.log(`Successfully created allergy intolerance with ID: ${createdAllergyIntolerance.id}`);
      return createdAllergyIntolerance;
    } catch (error) {
      console.error('Error in allergy intolerance service:', error);
      throw error;
    }
  }

  async getAllergyIntolerancesByPatient(patientId: string): Promise<AllergyIntolerance[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new Error('Patient ID is required');
      }

      // Check if the patient exists
      const patient = await this.userRepository.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      const allergyIntolerances = await this.allergyIntoleranceRepository.getAllergyIntolerancesByPatient(patientId);
      
      console.log(`Retrieved ${allergyIntolerances.length} allergy intolerances for patient ${patientId}`);
      return allergyIntolerances;
    } catch (error) {
      console.error('Error in allergy intolerance service:', error);
      throw error;
    }
  }
}
