import { Request, Response } from 'express';
import { PatientService } from '../domain/services/patientService';
import { Patient } from '../data/datatypes/fhirPatient';

export class PatientController {
  private patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  async getAllPatients(req: Request, res: Response): Promise<void> {
    try {   
      const patients = await this.patientService.getAllPatients();
      
      res.status(200).json({
        success: true,
        data: patients,
        count: patients.length,
        message: `Successfully retrieved ${patients.length} patients`
      });
    } catch (error) {
      console.error('Error in patient controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve patients'
      });
    }
  }

  async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
     
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Patient ID is required'
        });
        return;
      }

      const patient = await this.patientService.getPatientById(id);
      
      if (!patient) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Patient with ID ${id} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: patient,
        message: 'Patient retrieved successfully'
      });
    } catch (error) {
      console.error('Error in patient controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve patient'
      });
    }
  }

  async createPatient(req: Request, res: Response): Promise<void> {
    try {
      const patientData: Patient = req.body;

      // Validate request body
      if (!patientData || Object.keys(patientData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Patient data is required'
        });
        return;
      }

      // Ensure resourceType is set
      if (!patientData.resourceType) {
        patientData.resourceType = 'Patient';
      }

      const createdPatient = await this.patientService.createPatient(patientData);
      
      res.status(201).json({
        success: true,
        data: createdPatient,
        message: 'Patient created successfully'
      });
    } catch (error) {
      console.error('Error in patient controller:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid resource type')) {
          res.status(400).json({
            success: false,
            error: 'Bad request',
            message: error.message
          });
          return;
        }
        
        if (error.message.includes('same name') && error.message.includes('birthdate')) {
          res.status(409).json({
            success: false,
            error: 'Conflict',
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create patient'
      });
    }
  }
}
