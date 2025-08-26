import axios from 'axios';
import { Practitioner } from '../../datatypes/fhirPractitioner';
import { config } from '../../../config/environment';

export interface FhirResponse<T> {
  resourceType: string;
  total?: number;
  entry?: Array<{
    resource: T;
  }>;
}

export class PractitionerRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.fhirUrl;
  }

  async getPractitioners(): Promise<Practitioner[]> {
    try {
      const response = await axios.get<FhirResponse<Practitioner>>(`${this.baseUrl}/Practitioner`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error('Error fetching practitioners from FHIR:', error);
      throw new Error('Failed to fetch practitioners from FHIR server');
    }
  }

  async getPractitionerById(id: string): Promise<Practitioner | null> {
    try {
      const response = await axios.get<Practitioner>(`${this.baseUrl}/Practitioner/${id}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching practitioner ${id} from FHIR:`, error);
      return null;
    }
  }

  async createPractitioner(practitioner: Practitioner): Promise<Practitioner> {
    try {
      const response = await axios.post<Practitioner>(`${this.baseUrl}/Practitioner`, practitioner, {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating practitioner in FHIR:', error);
      throw new Error('Failed to create practitioner in FHIR server');
    }
  }
}
