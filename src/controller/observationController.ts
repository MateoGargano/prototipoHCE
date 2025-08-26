import { Request, Response } from 'express';
import { ObservationService } from '../domain/services/observationService';
import { Observation } from '../data/datatypes/fhirObservation';

export class ObservationController {
  private observationService: ObservationService;

  constructor() {
    this.observationService = new ObservationService();
  }

  async getAllObservations(req: Request, res: Response): Promise<void> {
    try {   
      const observations = await this.observationService.getAllObservations();
      
      res.status(200).json({
        success: true,
        data: observations,
        count: observations.length,
        message: `Successfully retrieved ${observations.length} observations`
      });
    } catch (error) {
      console.error('Error in observation controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve observations'
      });
    }
  }

  async getObservationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
     
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Observation ID is required'
        });
        return;
      }

      const observation = await this.observationService.getObservationById(id);
      
      if (!observation) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Observation with ID ${id} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: observation,
        message: 'Observation retrieved successfully'
      });
    } catch (error) {
      console.error('Error in observation controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve observation'
      });
    }
  }

  async createObservation(req: Request, res: Response): Promise<void> {
    try {
      const observationData: Observation = req.body;

      // Validate request body
      if (!observationData || Object.keys(observationData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Observation data is required'
        });
        return;
      }

      // Ensure resourceType is set
      if (!observationData.resourceType) {
        observationData.resourceType = 'Observation';
      }

      const createdObservation = await this.observationService.createObservation(observationData);
      
      res.status(201).json({
        success: true,
        data: createdObservation,
        message: 'Observation created successfully'
      });
    } catch (error) {
      console.error('Error in observation controller:', error);
      
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
        message: 'Failed to create observation'
      });
    }
  }

  async getObservationsByPatient(req: Request, res: Response): Promise<void> {
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

      const observations = await this.observationService.getObservationsByPatient(patientId);
      
      res.status(200).json({
        success: true,
        data: observations,
        count: observations.length,
        message: `Successfully retrieved ${observations.length} observations for patient ${patientId}`
      });
    } catch (error) {
      console.error('Error in observation controller:', error);
      
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
        message: 'Failed to retrieve observations for patient'
      });
    }
  }
}
