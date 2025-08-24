import { Patient } from '../../data/datatypes/fhirPatient';
import { FhirRepository } from '../../data/repositories/fhirRepository';

export class PatientService {
  private fhirRepository: FhirRepository;

  constructor() {
    this.fhirRepository = new FhirRepository();
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      const patients = await this.fhirRepository.getPatients();
      
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

      const patient = await this.fhirRepository.getPatientById(id);
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

      // Check for duplicate patient (same name and birthdate)
      if (patientData.name && patientData.name.length > 0 && patientData.birthDate) {
        const primaryName = patientData.name[0];
        
        if (primaryName && primaryName.family) {
          const existingPatients = await this.fhirRepository.searchPatientsByNameAndBirthdate(
            primaryName.family,
            primaryName.given || [],
            patientData.birthDate
          );

          if (existingPatients.length > 0) {
            const existingPatient = existingPatients[0];
            if (existingPatient) {
              const existingName = existingPatient.name?.[0];
              const existingNameStr = existingName ? 
                `${existingName.given?.join(' ') || ''} ${existingName.family || ''}`.trim() : 
                'Unknown';
              
              throw new Error(`A patient with the same name (${existingNameStr}) and birthdate (${patientData.birthDate}) already exists`);
            }
          }
        }
      }

      // Remove ID if provided (FHIR server will assign one)
      const patientToCreate = { ...patientData };
      delete patientToCreate.id;

      const createdPatient = await this.fhirRepository.createPatient(patientToCreate);
      
      console.log(`Successfully created patient with ID: ${createdPatient.id}`);
      return createdPatient;
    } catch (error) {
      console.error('Error in patient service:', error);
      throw error;
    }
  }
}
