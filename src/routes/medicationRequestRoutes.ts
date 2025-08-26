import { Router } from 'express';
import { MedicationRequestController } from '../controller/medicationRequestController';

const router = Router();
const medicationRequestController = new MedicationRequestController();

// GET /medication-requests - Get all medication requests
router.get('/', (req, res) => medicationRequestController.getAllMedicationRequests(req, res));

// POST /medication-requests - Create a new medication request
router.post('/', (req, res) => medicationRequestController.createMedicationRequest(req, res));

// GET /medication-requests/:id - Get medication request by ID
router.get('/:id', (req, res) => medicationRequestController.getMedicationRequestById(req, res));

// GET /medication-requests/patient/:patientId - Get medication requests by patient ID
router.get('/patient/:patientId', (req, res) => medicationRequestController.getMedicationRequestsByPatient(req, res));

export default router;
