import { Router } from 'express';
import { ConditionController } from '../controller/conditionController';

const router = Router();
const conditionController = new ConditionController();

// GET /conditions - Get all conditions
router.get('/', (req, res) => conditionController.getAllConditions(req, res));

// POST /conditions - Create a new condition
router.post('/', (req, res) => conditionController.createCondition(req, res));

// GET /conditions/:id - Get condition by ID
router.get('/:id', (req, res) => conditionController.getConditionById(req, res));

// GET /conditions/patient/:patientId - Get conditions by patient ID
router.get('/patient/:patientId', (req, res) => conditionController.getConditionsByPatient(req, res));

export default router;
