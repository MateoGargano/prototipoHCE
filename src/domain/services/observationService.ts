import { Observation } from '../../data/datatypes/fhirObservation';
import { ObservationRepository } from '../../data/repositories/fhir/observationRepository';
import { UserRepository } from '../../data/repositories/fhir/patientRepository';

export class ObservationService {
  private observationRepository: ObservationRepository;
  private userRepository: UserRepository;

  constructor() {
    this.observationRepository = new ObservationRepository();
    this.userRepository = new UserRepository();
  }

  async getAllObservations(): Promise<Observation[]> {
    try {
      const observations = await this.observationRepository.getObservations();
      
      if (!observations || observations.length === 0) {
        console.log('No observations found in FHIR server');
        return [];
      }

      console.log(`Retrieved ${observations.length} observations from FHIR server`);
      return observations;
    } catch (error) {
      console.error('Error in observation service:', error);
      throw error;
    }
  }

  async getObservationById(id: string): Promise<Observation | null> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Observation ID is required');
      }

      const observation = await this.observationRepository.getObservationById(id);
      return observation;
    } catch (error) {
      console.error('Error in observation service:', error);
      throw error;
    }
  }

  async createObservation(observationData: Observation): Promise<Observation> {
    try {
      if (!observationData.resourceType || observationData.resourceType !== 'Observation') {
        throw new Error('Invalid resource type. Must be "Observation"');
      }

      // Validate that the patient exists
      if (!observationData.subject || !observationData.subject.reference) {
        throw new Error('Observation must have a valid patient reference');
      }

      // Extract patient ID from reference (e.g., "Patient/123" -> "123")
      const patientReference = observationData.subject.reference;
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
      if (!observationData.code) {
        throw new Error('Observation code is required');
      }

      // Remove ID if provided (FHIR server will assign one)
      const observationToCreate = { ...observationData };
      delete observationToCreate.id;

      const createdObservation = await this.observationRepository.createObservation(observationToCreate);
      
      console.log(`Successfully created observation with ID: ${createdObservation.id}`);
      return createdObservation;
    } catch (error) {
      console.error('Error in observation service:', error);
      throw error;
    }
  }

  async getObservationsByPatient(patientId: string): Promise<Observation[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new Error('Patient ID is required');
      }

      // Check if the patient exists
      const patient = await this.userRepository.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      const observations = await this.observationRepository.getObservationsByPatient(patientId);
      
      console.log(`Retrieved ${observations.length} observations for patient ${patientId}`);
      return observations;
    } catch (error) {
      console.error('Error in observation service:', error);
      throw error;
    }
  }
}
