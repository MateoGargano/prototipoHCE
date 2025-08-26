import { Request, Response } from 'express';
import { EncounterService } from '../domain/services/encounterService';
import { Encounter } from '../data/datatypes/fhirEncounter';

export class EncounterController {
  private encounterService: EncounterService;

  constructor() {
    this.encounterService = new EncounterService();
  }

  async getAllEncounters(req: Request, res: Response): Promise<void> {
    try {   
      const encounters = await this.encounterService.getAllEncounters();
      
      res.status(200).json({
        success: true,
        data: encounters,
        count: encounters.length,
        message: `Successfully retrieved ${encounters.length} encounters`
      });
    } catch (error) {
      console.error('Error in encounter controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve encounters'
      });
    }
  }

  async getEncounterById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
     
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Encounter ID is required'
        });
        return;
      }

      const encounter = await this.encounterService.getEncounterById(id);
      
      if (!encounter) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Encounter with ID ${id} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: encounter,
        message: 'Encounter retrieved successfully'
      });
    } catch (error) {
      console.error('Error in encounter controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve encounter'
      });
    }
  }

  async createEncounter(req: Request, res: Response): Promise<void> {
    try {
      const encounterData: Encounter = req.body;

      // Validate request body
      if (!encounterData || Object.keys(encounterData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Encounter data is required'
        });
        return;
      }

      // Ensure resourceType is set
      if (!encounterData.resourceType) {
        encounterData.resourceType = 'Encounter';
      }

      const createdEncounter = await this.encounterService.createEncounter(encounterData);
      
      res.status(201).json({
        success: true,
        data: createdEncounter,
        message: 'Encounter created successfully'
      });
    } catch (error) {
      console.error('Error in encounter controller:', error);
      
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

        if (error.message.includes('is required')) {
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
        message: 'Failed to create encounter'
      });
    }
  }

  async getEncountersByPatient(req: Request, res: Response): Promise<void> {
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

      const encounters = await this.encounterService.getEncountersByPatient(patientId);
      
      res.status(200).json({
        success: true,
        data: encounters,
        count: encounters.length,
        message: `Successfully retrieved ${encounters.length} encounters for patient ${patientId}`
      });
    } catch (error) {
      console.error('Error in encounter controller:', error);
      
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
        message: 'Failed to retrieve encounters for patient'
      });
    }
  }
}
