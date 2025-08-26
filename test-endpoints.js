const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test script for FHIR Complete Healthcare API endpoints
// PATCH Endpoints use JSON Patch format (RFC 6902):
// - Content-Type: application/json-patch+json
// - Body: Array of operations with op, path, and value
// - Example: [{"op": "add", "path": "/deceasedDateTime", "value": "2025-08-26T18:00:00Z"}]

// Lista de todos los endpoints a probar
const endpoints = [
    // Health check
    { method: 'GET', path: '/health', name: 'Health Check' },
    
    // Root endpoint
    { method: 'GET', path: '/', name: 'Root Endpoint' },
    
    // Patient endpoints
    { method: 'GET', path: '/patients', name: 'Get All Patients' },
    { method: 'POST', path: '/patients', name: 'Create Patient', data: {
        resourceType: 'Patient',
        name: [{ family: 'Gargano', given: ['Mateo'] }],
        birthDate: '2000-01-18'
    }},
    { method: 'GET', path: '/patients/1', name: 'Get Patient by ID' },
    { method: 'PATCH', path: '/patients/1', name: 'Update Patient (JSON Patch)', data: {
        deceasedDateTime: '2025-08-26T18:00:00Z'
    }, 
    note: 'Converts to JSON Patch format: [{"op": "add", "path": "/deceasedDateTime", "value": "2025-08-26T18:00:00Z"}]'
    },
    
    // Practitioner endpoints
    { method: 'GET', path: '/practitioners', name: 'Get All Practitioners' },
    { method: 'POST', path: '/practitioners', name: 'Create Practitioner', data: {
        resourceType: 'Practitioner',
        active: true,
        name: [{ 
            use: 'official',
            family: 'Smith', 
            given: ['John', 'Michael'] 
        }],
        telecom: [{
            system: 'phone',
            value: '+1-555-0123',
            use: 'work'
        }],
        gender: 'male',
        birthDate: '1980-05-15',
        qualification: [{
            code: {
                coding: [{
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0360/2.7',
                    code: 'MD',
                    display: 'Doctor of Medicine'
                }]
            }
        }]
    }},
    { method: 'GET', path: '/practitioners/2', name: 'Get Practitioner by ID' },
    
    // Encounter endpoints
    { method: 'GET', path: '/encounters', name: 'Get All Encounters' },
    { method: 'POST', path: '/encounters', name: 'Create Encounter', data: {
        resourceType: 'Encounter',
        status: 'planned',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'Ambulatory' },
        subject: { reference: 'Patient/1' }
    }},
    { method: 'GET', path: '/encounters/3', name: 'Get Encounter by ID' },
    { method: 'GET', path: '/encounters/patient/1', name: 'Get Encounters by Patient' },
    
    // AllergyIntolerance endpoints
    { method: 'GET', path: '/allergy-intolerances', name: 'Get All Allergy Intolerances' },
    { method: 'POST', path: '/allergy-intolerances', name: 'Create Allergy Intolerance', data: {
        resourceType: 'AllergyIntolerance',
        patient: { reference: 'Patient/1' },
        manifestation: [{ coding: [{ system: 'http://snomed.info/sct', code: '247472004', display: 'Hives' }] }]
    }},
    { method: 'GET', path: '/allergy-intolerances/4', name: 'Get Allergy Intolerance by ID' },
    { method: 'GET', path: '/allergy-intolerances/patient/1', name: 'Get Allergy Intolerances by Patient' },
    
    // Condition endpoints
    { method: 'GET', path: '/conditions', name: 'Get All Conditions' },
    { method: 'POST', path: '/conditions', name: 'Create Condition', data: {
        resourceType: 'Condition',
        subject: { reference: 'Patient/1' },
        code: { coding: [{ system: 'http://snomed.info/sct', code: '38341003', display: 'Hypertensive disorder' }] }
    }},
    { method: 'GET', path: '/conditions/5', name: 'Get Condition by ID' },
    { method: 'GET', path: '/conditions/patient/1', name: 'Get Conditions by Patient' },
    
    // Observation endpoints
    { method: 'GET', path: '/observations', name: 'Get All Observations' },
    { method: 'POST', path: '/observations', name: 'Create Observation', data: {
        resourceType: 'Observation',
        subject: { reference: 'Patient/1' },
        code: { coding: [{ system: 'http://loinc.org', code: '8302-2', display: 'Body height' }] },
        status: 'final',
        valueQuantity: { value: 170, unit: 'cm' }
    }},
    { method: 'GET', path: '/observations/6', name: 'Get Observation by ID' },
    { method: 'GET', path: '/observations/patient/1', name: 'Get Observations by Patient' },
    
    // MedicationRequest endpoints
    { method: 'GET', path: '/medication-requests', name: 'Get All Medication Requests' },
    { method: 'POST', path: '/medication-requests', name: 'Create Medication Request', data: {
        resourceType: 'MedicationRequest',
        subject: { reference: 'Patient/1' },
        intent: 'order',
        medicationCodeableConcept: { coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '197361', display: 'Acetaminophen 500 MG Oral Tablet' }] }
    }},
    { method: 'GET', path: '/medication-requests/7', name: 'Get Medication Request by ID' },
    { method: 'GET', path: '/medication-requests/patient/1', name: 'Get Medication Requests by Patient' }
];

async function testEndpoint(endpoint) {
    try {
        const config = {
            method: endpoint.method,
            url: `${BASE_URL}${endpoint.path}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (endpoint.data) {
            config.data = endpoint.data;
        }
        
        const response = await axios(config);
        
        return {
            name: endpoint.name,
            path: endpoint.path,
            method: endpoint.method,
            status: response.status,
            success: true,
            message: `✅ Success: ${response.status} ${response.statusText}`
        };
    } catch (error) {
        const status = error.response?.status || 'No Response';
        const message = error.response?.data?.message || error.message || 'Unknown error';
        
        return {
            name: endpoint.name,
            path: endpoint.path,
            method: endpoint.method,
            status: status,
            success: false,
            message: `❌ Failed: ${status} - ${message}`
        };
    }
}

async function runAllTests() {
    console.log('🚀 Starting API Endpoint Tests...\n');
    console.log(`Base URL: ${BASE_URL}\n`);
    
    const results = [];
    
    for (const endpoint of endpoints) {
        console.log(`Testing: ${endpoint.method} ${endpoint.path} - ${endpoint.name}`);
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n✅ SUCCESSFUL (${successful.length}/${results.length}):`);
    successful.forEach(result => {
        console.log(`  ${result.method} ${result.path} - ${result.name}`);
    });
    
    console.log(`\n❌ FAILED (${failed.length}/${results.length}):`);
    failed.forEach(result => {
        console.log(`  ${result.method} ${result.path} - ${result.name}`);
        console.log(`    Error: ${result.message}`);
    });
    
    console.log(`\n📈 SUCCESS RATE: ${((successful.length / results.length) * 100).toFixed(1)}%`);
    
    // Detailed results
    console.log('\n' + '='.repeat(80));
    console.log('📋 DETAILED RESULTS');
    console.log('='.repeat(80));
    
    results.forEach(result => {
        console.log(`\n${result.message}`);
        console.log(`  Endpoint: ${result.method} ${result.path}`);
        console.log(`  Name: ${result.name}`);
        console.log(`  Status: ${result.status}`);
    });
}

// Run the tests
runAllTests().catch(console.error);
