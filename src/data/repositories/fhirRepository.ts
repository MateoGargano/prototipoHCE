import axios from 'axios';
import { Patient } from '../datatypes/fhirPatient';
import { config } from '../../config/environment';

export interface FhirResponse<T> {
  resourceType: string;
  total?: number;
  entry?: Array<{
    resource: T;
  }>;
}

export class FhirRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.fhirUrl;
  }

  async getPatients(): Promise<Patient[]> {
    try {
      const response = await axios.get<FhirResponse<Patient>>(`${this.baseUrl}/Patient`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error('Error fetching patients from FHIR:', error);
      throw new Error('Failed to fetch patients from FHIR server');
    }
  }

  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const response = await axios.get<Patient>(`${this.baseUrl}/Patient/${id}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id} from FHIR:`, error);
      return null;
    }
  }

  async createPatient(patient: Patient): Promise<Patient> {
    try {
      const response = await axios.post<Patient>(`${this.baseUrl}/Patient`, patient, {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating patient in FHIR:', error);
      throw new Error('Failed to create patient in FHIR server');
    }
  }

  async searchPatientsByNameAndBirthdate(familyName: string, givenNames: string[], birthDate: string): Promise<Patient[]> {
    try {
      // Build search parameters
      const searchParams = new URLSearchParams();
      searchParams.append('name', familyName);
      searchParams.append('birthdate', birthDate);
      
      const response = await axios.get<FhirResponse<Patient>>(`${this.baseUrl}/Patient?${searchParams.toString()}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        // Filter by exact name match (family + given names)
        return response.data.entry
          .map(entry => entry.resource)
          .filter(patient => {
            if (!patient.name || patient.name.length === 0) {
              return false;
            }
            
            const patientNameEntry = patient.name[0]; // Check first name entry
            if (!patientNameEntry || patientNameEntry.family !== familyName) {
              return false;
            }
            
            // If no given names in search criteria, just check family name
            if (!givenNames || givenNames.length === 0) {
              return true; // Family name matches, no given names to check
            }
            
            // If patient has no given names but search does, no match
            if (!patientNameEntry.given || patientNameEntry.given.length === 0) {
              return false;
            }
            
            const patientGivenNames = patientNameEntry.given || [];
            const searchGivenNames = givenNames || [];
            
            // Check if all search given names are present in patient given names
            return searchGivenNames.every(searchName => 
              patientGivenNames.some(patientGivenName => 
                patientGivenName.toLowerCase() === searchName.toLowerCase()
              )
            );
          });
      }

      return [];
    } catch (error) {
      console.error('Error searching patients by name and birthdate:', error);
      throw new Error('Failed to search patients in FHIR server');
    }
  }
}
