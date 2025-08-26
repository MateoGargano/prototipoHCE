import { Request, Response } from 'express';
import { PractitionerService } from '../domain/services/practitionerService';
import { Practitioner } from '../data/datatypes/fhirPractitioner';

export class PractitionerController {
  private practitionerService: PractitionerService;

  constructor() {
    this.practitionerService = new PractitionerService();
  }

  async getAllPractitioners(req: Request, res: Response): Promise<void> {
    try {   
      const practitioners = await this.practitionerService.getAllPractitioners();
      
      res.status(200).json({
        success: true,
        data: practitioners,
        count: practitioners.length,
        message: `Successfully retrieved ${practitioners.length} practitioners`
      });
    } catch (error) {
      console.error('Error in practitioner controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve practitioners'
      });
    }
  }

  async getPractitionerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
     
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Practitioner ID is required'
        });
        return;
      }

      const practitioner = await this.practitionerService.getPractitionerById(id);
      
      if (!practitioner) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Practitioner with ID ${id} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: practitioner,
        message: 'Practitioner retrieved successfully'
      });
    } catch (error) {
      console.error('Error in practitioner controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve practitioner'
      });
    }
  }

  async createPractitioner(req: Request, res: Response): Promise<void> {
    try {
      const practitionerData: Practitioner = req.body;

      // Validate request body
      if (!practitionerData || Object.keys(practitionerData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Practitioner data is required'
        });
        return;
      }

      // Ensure resourceType is set
      if (!practitionerData.resourceType) {
        practitionerData.resourceType = 'Practitioner';
      }

      const createdPractitioner = await this.practitionerService.createPractitioner(practitionerData);
      
      res.status(201).json({
        success: true,
        data: createdPractitioner,
        message: 'Practitioner created successfully'
      });
    } catch (error) {
      console.error('Error in practitioner controller:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid resource type')) {
          res.status(400).json({
            success: false,
            error: 'Bad request',
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create practitioner'
      });
    }
  }
}
