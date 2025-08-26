import axios from 'axios';
import { MedicationRequest } from '../../datatypes/fhirMedicationRequest';
import { config } from '../../../config/environment';

export interface FhirResponse<T> {
  resourceType: string;
  total?: number;
  entry?: Array<{
    resource: T;
  }>;
}

export class MedicationRequestRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.fhirUrl;
  }

  async getMedicationRequests(): Promise<MedicationRequest[]> {
    try {
      const response = await axios.get<FhirResponse<MedicationRequest>>(`${this.baseUrl}/MedicationRequest`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error('Error fetching medication requests from FHIR:', error);
      throw new Error('Failed to fetch medication requests from FHIR server');
    }
  }

  async getMedicationRequestById(id: string): Promise<MedicationRequest | null> {
    try {
      const response = await axios.get<MedicationRequest>(`${this.baseUrl}/MedicationRequest/${id}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching medication request ${id} from FHIR:`, error);
      return null;
    }
  }

  async createMedicationRequest(medicationRequest: MedicationRequest): Promise<MedicationRequest> {
    try {
      const response = await axios.post<MedicationRequest>(`${this.baseUrl}/MedicationRequest`, medicationRequest, {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating medication request in FHIR:', error);
      throw new Error('Failed to create medication request in FHIR server');
    }
  }

  async getMedicationRequestsByPatient(patientId: string): Promise<MedicationRequest[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('subject', `Patient/${patientId}`);
      
      const response = await axios.get<FhirResponse<MedicationRequest>>(`${this.baseUrl}/MedicationRequest?${searchParams.toString()}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error(`Error fetching medication requests for patient ${patientId} from FHIR:`, error);
      throw new Error('Failed to fetch medication requests for patient from FHIR server');
    }
  }
}
