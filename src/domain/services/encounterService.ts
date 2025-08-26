import { Encounter } from '../../data/datatypes/fhirEncounter';
import { EncounterRepository } from '../../data/repositories/fhir/encounterRepository';
import { UserRepository } from '../../data/repositories/fhir/patientRepository';

export class EncounterService {
  private encounterRepository: EncounterRepository;
  private userRepository: UserRepository;

  constructor() {
    this.encounterRepository = new EncounterRepository();
    this.userRepository = new UserRepository();
  }

  async getAllEncounters(): Promise<Encounter[]> {
    try {
      const encounters = await this.encounterRepository.getEncounters();
      
      if (!encounters || encounters.length === 0) {
        console.log('No encounters found in FHIR server');
        return [];
      }

      console.log(`Retrieved ${encounters.length} encounters from FHIR server`);
      return encounters;
    } catch (error) {
      console.error('Error in encounter service:', error);
      throw error;
    }
  }

  async getEncounterById(id: string): Promise<Encounter | null> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Encounter ID is required');
      }

      const encounter = await this.encounterRepository.getEncounterById(id);
      return encounter;
    } catch (error) {
      console.error('Error in encounter service:', error);
      throw error;
    }
  }

  async createEncounter(encounterData: Encounter): Promise<Encounter> {
    try {
      if (!encounterData.resourceType || encounterData.resourceType !== 'Encounter') {
        throw new Error('Invalid resource type. Must be "Encounter"');
      }

      // Validate that the patient exists
      if (!encounterData.subject || !encounterData.subject.reference) {
        throw new Error('Encounter must have a valid patient reference');
      }

      // Extract patient ID from reference (e.g., "Patient/123" -> "123")
      const patientReference = encounterData.subject.reference;
      const patientId = patientReference.replace('Patient/', '');
      
      if (!patientId) {
        throw new Error('Invalid patient reference format');
      }

      // Check if the patient exists
      const patient = await this.userRepository.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      // Validate required fields
      if (!encounterData.status) {
        throw new Error('Encounter status is required');
      }

      if (!encounterData.class) {
        throw new Error('Encounter class is required');
      }

      // Remove ID if provided (FHIR server will assign one)
      const encounterToCreate = { ...encounterData };
      delete encounterToCreate.id;

      const createdEncounter = await this.encounterRepository.createEncounter(encounterToCreate);
      
      console.log(`Successfully created encounter with ID: ${createdEncounter.id}`);
      return createdEncounter;
    } catch (error) {
      console.error('Error in encounter service:', error);
      throw error;
    }
  }

  async getEncountersByPatient(patientId: string): Promise<Encounter[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new Error('Patient ID is required');
      }

      // Check if the patient exists
      const patient = await this.userRepository.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      const encounters = await this.encounterRepository.getEncountersByPatient(patientId);
      
      console.log(`Retrieved ${encounters.length} encounters for patient ${patientId}`);
      return encounters;
    } catch (error) {
      console.error('Error in encounter service:', error);
      throw error;
    }
  }
}
