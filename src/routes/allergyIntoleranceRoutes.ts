import { Router } from 'express';
import { AllergyIntoleranceController } from '../controller/allergyIntoleranceController';

const router = Router();
const allergyIntoleranceController = new AllergyIntoleranceController();

// GET /allergy-intolerances - Get all allergy intolerances
router.get('/', (req, res) => allergyIntoleranceController.getAllAllergyIntolerances(req, res));

// POST /allergy-intolerances - Create a new allergy intolerance
router.post('/', (req, res) => allergyIntoleranceController.createAllergyIntolerance(req, res));

// GET /allergy-intolerances/:id - Get allergy intolerance by ID
router.get('/:id', (req, res) => allergyIntoleranceController.getAllergyIntoleranceById(req, res));

// GET /allergy-intolerances/patient/:patientId - Get allergy intolerances by patient ID
router.get('/patient/:patientId', (req, res) => allergyIntoleranceController.getAllergyIntolerancesByPatient(req, res));

export default router;
