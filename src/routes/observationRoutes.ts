import { Router } from 'express';
import { ObservationController } from '../controller/observationController';

const router = Router();
const observationController = new ObservationController();

// GET /observations - Get all observations
router.get('/', (req, res) => observationController.getAllObservations(req, res));

// POST /observations - Create a new observation
router.post('/', (req, res) => observationController.createObservation(req, res));

// GET /observations/:id - Get observation by ID
router.get('/:id', (req, res) => observationController.getObservationById(req, res));

// GET /observations/patient/:patientId - Get observations by patient ID
router.get('/patient/:patientId', (req, res) => observationController.getObservationsByPatient(req, res));

export default router;
