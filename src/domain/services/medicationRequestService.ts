import { MedicationRequest } from '../../data/datatypes/fhirMedicationRequest';
import { MedicationRequestRepository } from '../../data/repositories/fhir/medicationRequestRepository';
import { UserRepository } from '../../data/repositories/fhir/patientRepository';

export class MedicationRequestService {
  private medicationRequestRepository: MedicationRequestRepository;
  private userRepository: UserRepository;

  constructor() {
    this.medicationRequestRepository = new MedicationRequestRepository();
    this.userRepository = new UserRepository();
  }

  async getAllMedicationRequests(): Promise<MedicationRequest[]> {
    try {
      const medicationRequests = await this.medicationRequestRepository.getMedicationRequests();
      
      if (!medicationRequests || medicationRequests.length === 0) {
        console.log('No medication requests found in FHIR server');
        return [];
      }

      console.log(`Retrieved ${medicationRequests.length} medication requests from FHIR server`);
      return medicationRequests;
    } catch (error) {
      console.error('Error in medication request service:', error);
      throw error;
    }
  }

  async getMedicationRequestById(id: string): Promise<MedicationRequest | null> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Medication request ID is required');
      }

      const medicationRequest = await this.medicationRequestRepository.getMedicationRequestById(id);
      return medicationRequest;
    } catch (error) {
      console.error('Error in medication request service:', error);
      throw error;
    }
  }

  async createMedicationRequest(medicationRequestData: MedicationRequest): Promise<MedicationRequest> {
    try {
      if (!medicationRequestData.resourceType || medicationRequestData.resourceType !== 'MedicationRequest') {
        throw new Error('Invalid resource type. Must be "MedicationRequest"');
      }

      // Validate that the patient exists
      if (!medicationRequestData.subject || !medicationRequestData.subject.reference) {
        throw new Error('Medication request must have a valid patient reference');
      }

      // Extract patient ID from reference (e.g., "Patient/123" -> "123")
      const patientReference = medicationRequestData.subject.reference;
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
      if (!medicationRequestData.intent) {
        throw new Error('Medication request intent is required');
      }

      // Remove ID if provided (FHIR server will assign one)
      const medicationRequestToCreate = { ...medicationRequestData };
      delete medicationRequestToCreate.id;

      const createdMedicationRequest = await this.medicationRequestRepository.createMedicationRequest(medicationRequestToCreate);
      
      console.log(`Successfully created medication request with ID: ${createdMedicationRequest.id}`);
      return createdMedicationRequest;
    } catch (error) {
      console.error('Error in medication request service:', error);
      throw error;
    }
  }

  async getMedicationRequestsByPatient(patientId: string): Promise<MedicationRequest[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new Error('Patient ID is required');
      }

      // Check if the patient exists
      const patient = await this.userRepository.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      const medicationRequests = await this.medicationRequestRepository.getMedicationRequestsByPatient(patientId);
      
      console.log(`Retrieved ${medicationRequests.length} medication requests for patient ${patientId}`);
      return medicationRequests;
    } catch (error) {
      console.error('Error in medication request service:', error);
      throw error;
    }
  }
}
