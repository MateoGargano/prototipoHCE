import axios from 'axios';
import { Encounter } from '../../datatypes/fhirEncounter';
import { config } from '../../../config/environment';

export interface FhirResponse<T> {
  resourceType: string;
  total?: number;
  entry?: Array<{
    resource: T;
  }>;
}

export class EncounterRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.fhirUrl;
  }

  async getEncounters(): Promise<Encounter[]> {
    try {
      const response = await axios.get<FhirResponse<Encounter>>(`${this.baseUrl}/Encounter`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error('Error fetching encounters from FHIR:', error);
      throw new Error('Failed to fetch encounters from FHIR server');
    }
  }

  async getEncounterById(id: string): Promise<Encounter | null> {
    try {
      const response = await axios.get<Encounter>(`${this.baseUrl}/Encounter/${id}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching encounter ${id} from FHIR:`, error);
      return null;
    }
  }

  async createEncounter(encounter: Encounter): Promise<Encounter> {
    try {
      const response = await axios.post<Encounter>(`${this.baseUrl}/Encounter`, encounter, {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating encounter in FHIR:', error);
      throw new Error('Failed to create encounter in FHIR server');
    }
  }

  async getEncountersByPatient(patientId: string): Promise<Encounter[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('subject', `Patient/${patientId}`);
      
      const response = await axios.get<FhirResponse<Encounter>>(`${this.baseUrl}/Encounter?${searchParams.toString()}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error(`Error fetching encounters for patient ${patientId} from FHIR:`, error);
      throw new Error('Failed to fetch encounters for patient from FHIR server');
    }
  }
}
