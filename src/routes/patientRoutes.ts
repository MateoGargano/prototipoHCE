import { Router } from 'express';
import { PatientController } from '../controller/patientController';

const router = Router();
const patientController = new PatientController();

// GET /patients - Get all patients
router.get('/', (req, res) => patientController.getAllPatients(req, res));

// POST /patients - Create a new patient
router.post('/', (req, res) => patientController.createPatient(req, res));

// GET /patients/:id - Get patient by ID
router.get('/:id', (req, res) => patientController.getPatientById(req, res));

export default router;
