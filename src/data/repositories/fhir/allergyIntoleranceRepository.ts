import axios from 'axios';
import { AllergyIntolerance } from '../../datatypes/fhirAllergyIntolerance';
import { config } from '../../../config/environment';

export interface FhirResponse<T> {
  resourceType: string;
  total?: number;
  entry?: Array<{
    resource: T;
  }>;
}

export class AllergyIntoleranceRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.fhirUrl;
  }

  async getAllergyIntolerances(): Promise<AllergyIntolerance[]> {
    try {
      const response = await axios.get<FhirResponse<AllergyIntolerance>>(`${this.baseUrl}/AllergyIntolerance`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error('Error fetching allergy intolerances from FHIR:', error);
      throw new Error('Failed to fetch allergy intolerances from FHIR server');
    }
  }

  async getAllergyIntoleranceById(id: string): Promise<AllergyIntolerance | null> {
    try {
      const response = await axios.get<AllergyIntolerance>(`${this.baseUrl}/AllergyIntolerance/${id}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching allergy intolerance ${id} from FHIR:`, error);
      return null;
    }
  }

  async createAllergyIntolerance(allergyIntolerance: AllergyIntolerance): Promise<AllergyIntolerance> {
    try {
      const response = await axios.post<AllergyIntolerance>(`${this.baseUrl}/AllergyIntolerance`, allergyIntolerance, {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating allergy intolerance in FHIR:', error);
      throw new Error('Failed to create allergy intolerance in FHIR server');
    }
  }

  async getAllergyIntolerancesByPatient(patientId: string): Promise<AllergyIntolerance[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('patient', `Patient/${patientId}`);
      
      const response = await axios.get<FhirResponse<AllergyIntolerance>>(`${this.baseUrl}/AllergyIntolerance?${searchParams.toString()}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error(`Error fetching allergy intolerances for patient ${patientId} from FHIR:`, error);
      throw new Error('Failed to fetch allergy intolerances for patient from FHIR server');
    }
  }
}
