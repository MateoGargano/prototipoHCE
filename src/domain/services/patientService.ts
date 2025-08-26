import { Patient } from '../../data/datatypes/fhirPatient';
import { UserRepository } from '../../data/repositories/fhir/patientRepository';

export class PatientService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      const patients = await this.userRepository.getPatients();
      
      if (!patients || patients.length === 0) {
        console.log('No patients found in FHIR server');
        return [];
      }

      console.log(`Retrieved ${patients.length} patients from FHIR server`);
      return patients;
    } catch (error) {
      console.error('Error in patient service:', error);
      throw error;
    }
  }

  async getPatientById(id: string): Promise<Patient | null> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Patient ID is required');
      }

      const patient = await this.userRepository.getPatientById(id);
      return patient;
    } catch (error) {
      console.error('Error in patient service:', error);
      throw error;
    }
  }

  async createPatient(patientData: Patient): Promise<Patient> {
    try {
      if (!patientData.resourceType || patientData.resourceType !== 'Patient') {
        throw new Error('Invalid resource type. Must be "Patient"');
      }

      const createdPatient = await this.userRepository.createPatient(patientData);
      
      console.log(`Successfully created patient with ID: ${createdPatient.id}`);
      return createdPatient;
    } catch (error) {
      console.error('Error in patient service:', error);
      throw error;
    }
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Patient ID is required');
      }

      if (!updates || Object.keys(updates).length === 0) {
        throw new Error('Update data is required');
      }

      // Remove resourceType from updates if present to avoid conflicts
      const { resourceType, ...cleanUpdates } = updates;

      const updatedPatient = await this.userRepository.updatePatient(id, cleanUpdates);
      
      console.log(`Successfully updated patient with ID: ${id}`);
      return updatedPatient;
    } catch (error) {
      console.error('Error in patient service:', error);
      throw error;
    }
  }
}
