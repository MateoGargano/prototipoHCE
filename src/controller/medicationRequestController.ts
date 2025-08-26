import { Request, Response } from 'express';
import { MedicationRequestService } from '../domain/services/medicationRequestService';
import { MedicationRequest } from '../data/datatypes/fhirMedicationRequest';

export class MedicationRequestController {
  private medicationRequestService: MedicationRequestService;

  constructor() {
    this.medicationRequestService = new MedicationRequestService();
  }

  async getAllMedicationRequests(req: Request, res: Response): Promise<void> {
    try {   
      const medicationRequests = await this.medicationRequestService.getAllMedicationRequests();
      
      res.status(200).json({
        success: true,
        data: medicationRequests,
        count: medicationRequests.length,
        message: `Successfully retrieved ${medicationRequests.length} medication requests`
      });
    } catch (error) {
      console.error('Error in medication request controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve medication requests'
      });
    }
  }

  async getMedicationRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
     
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Medication request ID is required'
        });
        return;
      }

      const medicationRequest = await this.medicationRequestService.getMedicationRequestById(id);
      
      if (!medicationRequest) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Medication request with ID ${id} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: medicationRequest,
        message: 'Medication request retrieved successfully'
      });
    } catch (error) {
      console.error('Error in medication request controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve medication request'
      });
    }
  }

  async createMedicationRequest(req: Request, res: Response): Promise<void> {
    try {
      const medicationRequestData: MedicationRequest = req.body;

      // Validate request body
      if (!medicationRequestData || Object.keys(medicationRequestData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Medication request data is required'
        });
        return;
      }

      // Ensure resourceType is set
      if (!medicationRequestData.resourceType) {
        medicationRequestData.resourceType = 'MedicationRequest';
      }

      const createdMedicationRequest = await this.medicationRequestService.createMedicationRequest(medicationRequestData);
      
      res.status(201).json({
        success: true,
        data: createdMedicationRequest,
        message: 'Medication request created successfully'
      });
    } catch (error) {
      console.error('Error in medication request controller:', error);
      
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
        message: 'Failed to create medication request'
      });
    }
  }

  async getMedicationRequestsByPatient(req: Request, res: Response): Promise<void> {
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

      const medicationRequests = await this.medicationRequestService.getMedicationRequestsByPatient(patientId);
      
      res.status(200).json({
        success: true,
        data: medicationRequests,
        count: medicationRequests.length,
        message: `Successfully retrieved ${medicationRequests.length} medication requests for patient ${patientId}`
      });
    } catch (error) {
      console.error('Error in medication request controller:', error);
      
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
        message: 'Failed to retrieve medication requests for patient'
      });
    }
  }
}
