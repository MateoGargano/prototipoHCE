import axios from 'axios';
import { Patient } from '../../datatypes/fhirPatient';
import { config } from '../../../config/environment';

export interface FhirResponse<T> {
  resourceType: string;
  total?: number;
  entry?: Array<{
    resource: T;
  }>;
}

export class UserRepository {
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

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      // First get the current patient to merge with updates
      const currentPatient = await this.getPatientById(id);
      if (!currentPatient) {
        throw new Error(`Patient with ID ${id} not found`);
      }

      // Convert updates to FHIR PATCH Parameters format
      const patchParameters = this.convertUpdatesToPatchParameters(updates);

      // Add cache-busting timestamp
      const timestamp = Date.now();
      const response = await axios.patch<Patient>(`${this.baseUrl}/Patient/${id}?_t=${timestamp}`, patchParameters, {
        headers: {
          'Content-Type': 'application/json-patch+json',
          'Accept': 'application/fhir+json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error(`Error updating patient ${id} in FHIR:`, error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('FHIR Server Response Status:', error.response.status);
        console.error('FHIR Server Response Data:', error.response.data);
        console.error('FHIR Server Response Headers:', error.response.headers);
      }
      
      // Throw a more detailed error
      if (error.response?.data?.message) {
        throw new Error(`FHIR server error: ${error.response.data.message}`);
      } else if (error.response?.status) {
        throw new Error(`FHIR server error: HTTP ${error.response.status}`);
      } else {
        throw new Error(`Failed to update patient in FHIR server: ${error.message}`);
      }
    }
  }

  private convertUpdatesToPatchParameters(updates: Partial<Patient>): any {
    // Convert updates to JSON Patch format
    const operations: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        operations.push({
          op: "add",
          path: `/${key}`,
          value: value
        });
      }
    });
    
    return operations; // Return JSON Patch array
  }
}
