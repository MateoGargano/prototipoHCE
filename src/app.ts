import express from 'express';
import dotenv from 'dotenv';
import patientRoutes from './routes/patientRoutes';
import encounterRoutes from './routes/encounterRoutes';
import allergyIntoleranceRoutes from './routes/allergyIntoleranceRoutes';
import conditionRoutes from './routes/conditionRoutes';
import observationRoutes from './routes/observationRoutes';
import medicationRequestRoutes from './routes/medicationRequestRoutes';
import practitionerRoutes from './routes/practitionerRoutes';
import { config } from './config/environment';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/patients', patientRoutes);
app.use('/encounters', encounterRoutes);
app.use('/allergy-intolerances', allergyIntoleranceRoutes);
app.use('/conditions', conditionRoutes);
app.use('/observations', observationRoutes);
app.use('/medication-requests', medicationRequestRoutes);
app.use('/practitioners', practitionerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    fhirUrl: config.fhirUrl
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FHIR Complete Healthcare API',
    version: '1.0.0',
    endpoints: {
      patients: {
        GET: '/patients',
        POST: '/patients',
        GET_BY_ID: '/patients/:id',
        PATCH: '/patients/:id'
      },
      encounters: {
        GET: '/encounters',
        POST: '/encounters',
        GET_BY_ID: '/encounters/:id',
        GET_BY_PATIENT: '/encounters/patient/:patientId'
      },
      allergyIntolerances: {
        GET: '/allergy-intolerances',
        POST: '/allergy-intolerances',
        GET_BY_ID: '/allergy-intolerances/:id',
        GET_BY_PATIENT: '/allergy-intolerances/patient/:patientId'
      },
      conditions: {
        GET: '/conditions',
        POST: '/conditions',
        GET_BY_ID: '/conditions/:id',
        GET_BY_PATIENT: '/conditions/patient/:patientId'
      },
      observations: {
        GET: '/observations',
        POST: '/observations',
        GET_BY_ID: '/observations/:id',
        GET_BY_PATIENT: '/observations/patient/:patientId'
      },
      medicationRequests: {
        GET: '/medication-requests',
        POST: '/medication-requests',
        GET_BY_ID: '/medication-requests/:id',
        GET_BY_PATIENT: '/medication-requests/patient/:patientId'
      },
      practitioners: {
        GET: '/practitioners',
        POST: '/practitioners',
        GET_BY_ID: '/practitioners/:id'
      },
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

export default app;
