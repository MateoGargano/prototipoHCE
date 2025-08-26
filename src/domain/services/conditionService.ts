import { Condition } from '../../data/datatypes/fhirCondition';
import { ConditionRepository } from '../../data/repositories/fhir/conditionRepository';
import { UserRepository } from '../../data/repositories/fhir/patientRepository';

export class ConditionService {
  private conditionRepository: ConditionRepository;
  private userRepository: UserRepository;

  constructor() {
    this.conditionRepository = new ConditionRepository();
    this.userRepository = new UserRepository();
  }

  async getAllConditions(): Promise<Condition[]> {
    try {
      const conditions = await this.conditionRepository.getConditions();
      
      if (!conditions || conditions.length === 0) {
        console.log('No conditions found in FHIR server');
        return [];
      }

      console.log(`Retrieved ${conditions.length} conditions from FHIR server`);
      return conditions;
    } catch (error) {
      console.error('Error in condition service:', error);
      throw error;
    }
  }

  async getConditionById(id: string): Promise<Condition | null> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Condition ID is required');
      }

      const condition = await this.conditionRepository.getConditionById(id);
      return condition;
    } catch (error) {
      console.error('Error in condition service:', error);
      throw error;
    }
  }

  async createCondition(conditionData: Condition): Promise<Condition> {
    try {
      if (!conditionData.resourceType || conditionData.resourceType !== 'Condition') {
        throw new Error('Invalid resource type. Must be "Condition"');
      }

      // Validate that the patient exists
      if (!conditionData.subject || !conditionData.subject.reference) {
        throw new Error('Condition must have a valid patient reference');
      }

      // Extract patient ID from reference (e.g., "Patient/123" -> "123")
      const patientReference = conditionData.subject.reference;
      const patientId = patientReference.replace('Patient/', '');
      
      if (!patientId) {
        throw new Error('Invalid patient reference format');
      }

      // Check if the patient exists
      const patient = await this.userRepository.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      // Remove ID if provided (FHIR server will assign one)
      const conditionToCreate = { ...conditionData };
      delete conditionToCreate.id;

      const createdCondition = await this.conditionRepository.createCondition(conditionToCreate);
      
      console.log(`Successfully created condition with ID: ${createdCondition.id}`);
      return createdCondition;
    } catch (error) {
      console.error('Error in condition service:', error);
      throw error;
    }
  }

  async getConditionsByPatient(patientId: string): Promise<Condition[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new Error('Patient ID is required');
      }

      // Check if the patient exists
      const patient = await this.userRepository.getPatientById(patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      const conditions = await this.conditionRepository.getConditionsByPatient(patientId);
      
      console.log(`Retrieved ${conditions.length} conditions for patient ${patientId}`);
      return conditions;
    } catch (error) {
      console.error('Error in condition service:', error);
      throw error;
    }
  }
}
