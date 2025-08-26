import { Request, Response } from 'express';
import { ConditionService } from '../domain/services/conditionService';
import { Condition } from '../data/datatypes/fhirCondition';

export class ConditionController {
  private conditionService: ConditionService;

  constructor() {
    this.conditionService = new ConditionService();
  }

  async getAllConditions(req: Request, res: Response): Promise<void> {
    try {   
      const conditions = await this.conditionService.getAllConditions();
      
      res.status(200).json({
        success: true,
        data: conditions,
        count: conditions.length,
        message: `Successfully retrieved ${conditions.length} conditions`
      });
    } catch (error) {
      console.error('Error in condition controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve conditions'
      });
    }
  }

  async getConditionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
     
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Condition ID is required'
        });
        return;
      }

      const condition = await this.conditionService.getConditionById(id);
      
      if (!condition) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Condition with ID ${id} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: condition,
        message: 'Condition retrieved successfully'
      });
    } catch (error) {
      console.error('Error in condition controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve condition'
      });
    }
  }

  async createCondition(req: Request, res: Response): Promise<void> {
    try {
      const conditionData: Condition = req.body;

      // Validate request body
      if (!conditionData || Object.keys(conditionData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Condition data is required'
        });
        return;
      }

      // Ensure resourceType is set
      if (!conditionData.resourceType) {
        conditionData.resourceType = 'Condition';
      }

      const createdCondition = await this.conditionService.createCondition(conditionData);
      
      res.status(201).json({
        success: true,
        data: createdCondition,
        message: 'Condition created successfully'
      });
    } catch (error) {
      console.error('Error in condition controller:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid resource type')) {
          res.status(400).json({
            success: false,
            error: 'Bad request',
            message: error.message
          });
          return;
        }
        
        if (error.message.includes('must have a valid patient reference')) {
          res.status(400).json({
            success: false,
            error: 'Bad request',
            message: error.message
          });
          return;
        }

        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: 'Not found',
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create condition'
      });
    }
  }

  async getConditionsByPatient(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
     
      if (!patientId) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Patient ID is required'
        });
        return;
      }

      const conditions = await this.conditionService.getConditionsByPatient(patientId);
      
      res.status(200).json({
        success: true,
        data: conditions,
        count: conditions.length,
        message: `Successfully retrieved ${conditions.length} conditions for patient ${patientId}`
      });
    } catch (error) {
      console.error('Error in condition controller:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve conditions for patient'
      });
    }
  }
}
