// ----------------------------
// FHIR Core DataTypes (reused from fhirPatient.ts)
// ----------------------------

export interface Coding {
    system?: string;       // URI
    version?: string;
    code?: string;
    display?: string;
    userSelected?: boolean;
}

export interface CodeableConcept {
    coding?: Coding[];
    text?: string;
}

export interface Identifier {
    use?: "usual" | "official" | "temp" | "secondary" | "old";
    type?: CodeableConcept;
    system?: string;   // URI
    value?: string;
    period?: Period;
    assigner?: Reference;
}

export interface Reference {
    reference?: string; // e.g. "Patient/123"
    type?: string;      // uri
    identifier?: Identifier;
    display?: string;
}

export interface Period {
    start?: string; // dateTime
    end?: string;   // dateTime
}

export interface Quantity {
    value?: number;
    comparator?: "<" | "<=" | ">=" | ">";
    unit?: string;
    system?: string; // URI
    code?: string;
}

export interface Duration {
    value?: number;
    comparator?: "<" | "<=" | ">=" | ">";
    unit?: string;
    system?: string; // URI
    code?: string;
}

// ----------------------------
// Encounter-specific components
// ----------------------------

export interface EncounterStatusHistory {
    status: "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled" | "entered-in-error" | "unknown";
    period: Period;
}

export interface EncounterClassHistory {
    class: Coding;
    period: Period;
}

export interface EncounterParticipant {
    type?: CodeableConcept[];
    period?: Period;
    individual?: Reference;
}

export interface EncounterDiagnosis {
    condition: Reference; // Reference to Condition
    use?: CodeableConcept;
    rank?: number;
}

export interface EncounterHospitalization {
    preAdmissionIdentifier?: Identifier;
    origin?: Reference;
    admitSource?: CodeableConcept;
    reAdmission?: CodeableConcept;
    dietPreference?: CodeableConcept[];
    specialCourtesy?: CodeableConcept[];
    specialArrangement?: CodeableConcept[];
    destination?: Reference;
    dischargeDisposition?: CodeableConcept;
}

export interface EncounterLocation {
    location: Reference; // Reference to Location
    status?: "planned" | "active" | "reserved" | "completed";
    physicalType?: CodeableConcept;
    period?: Period;
}

// ----------------------------
// Encounter Resource
// ----------------------------

export interface Encounter {
    resourceType: "Encounter";
    id?: string;
    identifier?: Identifier[];
    status: "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled" | "entered-in-error" | "unknown";
    statusHistory?: EncounterStatusHistory[];
    class: Coding;
    classHistory?: EncounterClassHistory[];
    type?: CodeableConcept[];
    serviceType?: CodeableConcept;
    priority?: CodeableConcept;
    subject: Reference; // Reference to Patient (required)
    episodeOfCare?: Reference[];
    basedOn?: Reference[];
    participant?: EncounterParticipant[];
    appointment?: Reference[];
    period?: Period;
    length?: Duration;
    reasonCode?: CodeableConcept[];
    reasonReference?: Reference[];
    diagnosis?: EncounterDiagnosis[];
    account?: Reference[];
    hospitalization?: EncounterHospitalization;
    location?: EncounterLocation[];
    serviceProvider?: Reference;
    partOf?: Reference;
}
