import { Router } from 'express';
import { PractitionerController } from '../controller/practitionerController';

const router = Router();
const practitionerController = new PractitionerController();

// GET /practitioners - Get all practitioners
router.get('/', (req, res) => practitionerController.getAllPractitioners(req, res));

// POST /practitioners - Create a new practitioner
router.post('/', (req, res) => practitionerController.createPractitioner(req, res));

// GET /practitioners/:id - Get practitioner by ID
router.get('/:id', (req, res) => practitionerController.getPractitionerById(req, res));

export default router;
