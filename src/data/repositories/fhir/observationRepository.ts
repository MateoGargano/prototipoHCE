import axios from 'axios';
import { Observation } from '../../datatypes/fhirObservation';
import { config } from '../../../config/environment';

export interface FhirResponse<T> {
  resourceType: string;
  total?: number;
  entry?: Array<{
    resource: T;
  }>;
}

export class ObservationRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.fhirUrl;
  }

  async getObservations(): Promise<Observation[]> {
    try {
      const response = await axios.get<FhirResponse<Observation>>(`${this.baseUrl}/Observation`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error('Error fetching observations from FHIR:', error);
      throw new Error('Failed to fetch observations from FHIR server');
    }
  }

  async getObservationById(id: string): Promise<Observation | null> {
    try {
      const response = await axios.get<Observation>(`${this.baseUrl}/Observation/${id}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching observation ${id} from FHIR:`, error);
      return null;
    }
  }

  async createObservation(observation: Observation): Promise<Observation> {
    try {
      const response = await axios.post<Observation>(`${this.baseUrl}/Observation`, observation, {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating observation in FHIR:', error);
      throw new Error('Failed to create observation in FHIR server');
    }
  }

  async getObservationsByPatient(patientId: string): Promise<Observation[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('subject', `Patient/${patientId}`);
      
      const response = await axios.get<FhirResponse<Observation>>(`${this.baseUrl}/Observation?${searchParams.toString()}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error(`Error fetching observations for patient ${patientId} from FHIR:`, error);
      throw new Error('Failed to fetch observations for patient from FHIR server');
    }
  }
}
