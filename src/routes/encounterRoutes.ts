import { Router } from 'express';
import { EncounterController } from '../controller/encounterController';

const router = Router();
const encounterController = new EncounterController();

// GET /encounters - Get all encounters
router.get('/', (req, res) => encounterController.getAllEncounters(req, res));

// POST /encounters - Create a new encounter
router.post('/', (req, res) => encounterController.createEncounter(req, res));

// GET /encounters/:id - Get encounter by ID
router.get('/:id', (req, res) => encounterController.getEncounterById(req, res));

// GET /encounters/patient/:patientId - Get encounters by patient ID
router.get('/patient/:patientId', (req, res) => encounterController.getEncountersByPatient(req, res));

export default router;
