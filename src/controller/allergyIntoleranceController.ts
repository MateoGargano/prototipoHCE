import { Request, Response } from 'express';
import { AllergyIntoleranceService } from '../domain/services/allergyIntoleranceService';
import { AllergyIntolerance } from '../data/datatypes/fhirAllergyIntolerance';

export class AllergyIntoleranceController {
  private allergyIntoleranceService: AllergyIntoleranceService;

  constructor() {
    this.allergyIntoleranceService = new AllergyIntoleranceService();
  }

  async getAllAllergyIntolerances(req: Request, res: Response): Promise<void> {
    try {   
      const allergyIntolerances = await this.allergyIntoleranceService.getAllAllergyIntolerances();
      
      res.status(200).json({
        success: true,
        data: allergyIntolerances,
        count: allergyIntolerances.length,
        message: `Successfully retrieved ${allergyIntolerances.length} allergy intolerances`
      });
    } catch (error) {
      console.error('Error in allergy intolerance controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve allergy intolerances'
      });
    }
  }

  async getAllergyIntoleranceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
     
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Allergy intolerance ID is required'
        });
        return;
      }

      const allergyIntolerance = await this.allergyIntoleranceService.getAllergyIntoleranceById(id);
      
      if (!allergyIntolerance) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Allergy intolerance with ID ${id} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: allergyIntolerance,
        message: 'Allergy intolerance retrieved successfully'
      });
    } catch (error) {
      console.error('Error in allergy intolerance controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve allergy intolerance'
      });
    }
  }

  async createAllergyIntolerance(req: Request, res: Response): Promise<void> {
    try {
      const allergyIntoleranceData: AllergyIntolerance = req.body;

      // Validate request body
      if (!allergyIntoleranceData || Object.keys(allergyIntoleranceData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Allergy intolerance data is required'
        });
        return;
      }

      // Ensure resourceType is set
      if (!allergyIntoleranceData.resourceType) {
        allergyIntoleranceData.resourceType = 'AllergyIntolerance';
      }

      const createdAllergyIntolerance = await this.allergyIntoleranceService.createAllergyIntolerance(allergyIntoleranceData);
      
      res.status(201).json({
        success: true,
        data: createdAllergyIntolerance,
        message: 'Allergy intolerance created successfully'
      });
    } catch (error) {
      console.error('Error in allergy intolerance controller:', error);
      
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
        message: 'Failed to create allergy intolerance'
      });
    }
  }

  async getAllergyIntolerancesByPatient(req: Request, res: Response): Promise<void> {
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

      const allergyIntolerances = await this.allergyIntoleranceService.getAllergyIntolerancesByPatient(patientId);
      
      res.status(200).json({
        success: true,
        data: allergyIntolerances,
        count: allergyIntolerances.length,
        message: `Successfully retrieved ${allergyIntolerances.length} allergy intolerances for patient ${patientId}`
      });
    } catch (error) {
      console.error('Error in allergy intolerance controller:', error);
      
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
        message: 'Failed to retrieve allergy intolerances for patient'
      });
    }
  }
}
