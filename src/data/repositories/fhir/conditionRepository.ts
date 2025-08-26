import axios from 'axios';
import { Condition } from '../../datatypes/fhirCondition';
import { config } from '../../../config/environment';

export interface FhirResponse<T> {
  resourceType: string;
  total?: number;
  entry?: Array<{
    resource: T;
  }>;
}

export class ConditionRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.fhirUrl;
  }

  async getConditions(): Promise<Condition[]> {
    try {
      const response = await axios.get<FhirResponse<Condition>>(`${this.baseUrl}/Condition`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error('Error fetching conditions from FHIR:', error);
      throw new Error('Failed to fetch conditions from FHIR server');
    }
  }

  async getConditionById(id: string): Promise<Condition | null> {
    try {
      const response = await axios.get<Condition>(`${this.baseUrl}/Condition/${id}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching condition ${id} from FHIR:`, error);
      return null;
    }
  }

  async createCondition(condition: Condition): Promise<Condition> {
    try {
      const response = await axios.post<Condition>(`${this.baseUrl}/Condition`, condition, {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating condition in FHIR:', error);
      throw new Error('Failed to create condition in FHIR server');
    }
  }

  async getConditionsByPatient(patientId: string): Promise<Condition[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('subject', `Patient/${patientId}`);
      
      const response = await axios.get<FhirResponse<Condition>>(`${this.baseUrl}/Condition?${searchParams.toString()}`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.data.entry) {
        return response.data.entry.map(entry => entry.resource);
      }

      return [];
    } catch (error) {
      console.error(`Error fetching conditions for patient ${patientId} from FHIR:`, error);
      throw new Error('Failed to fetch conditions for patient from FHIR server');
    }
  }
}
