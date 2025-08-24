// ----------------------------
// FHIR Core DataTypes
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

export interface HumanName {
    use?: "usual" | "official" | "temp" | "nickname" | "anonymous" | "old" | "maiden";
    text?: string;
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
    period?: Period;
}

export interface ContactPoint {
    system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
    value?: string;
    use?: "home" | "work" | "temp" | "old" | "mobile";
    rank?: number;
    period?: Period;
}

export interface Address {
    use?: "home" | "work" | "temp" | "old" | "billing";
    type?: "postal" | "physical" | "both";
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    period?: Period;
}

export interface Attachment {
    contentType?: string;
    language?: string;
    data?: string; // base64Binary
    url?: string;
    size?: number;
    hash?: string; // base64Binary
    title?: string;
    creation?: string; // dateTime
}

export interface Reference {
    reference?: string; // e.g. "Organization/123"
    type?: string;      // uri
    identifier?: Identifier;
    display?: string;
}

export interface Period {
    start?: string; // dateTime
    end?: string;   // dateTime
}

// ----------------------------
// Patient-specific components
// ----------------------------

export interface Contact {
    relationship?: CodeableConcept[];
    name?: HumanName;
    telecom?: ContactPoint[];
    address?: Address;
    gender?: "male" | "female" | "other" | "unknown";
    organization?: Reference;
    period?: Period;
}

export interface Communication {
    language: CodeableConcept; // Required
    preferred?: boolean;
}

export interface Link {
    other: Reference; // Required
    type: "replaced-by" | "replaces" | "refer" | "seealso";
}

// ----------------------------
// Patient Resource
// ----------------------------

export interface Patient {
    resourceType: "Patient";
    id?: string;
    identifier?: Identifier[];
    active?: boolean;
    name?: HumanName[];
    telecom?: ContactPoint[];
    gender?: "male" | "female" | "other" | "unknown";
    birthDate?: string; // date
    deceasedBoolean?: boolean;
    deceasedDateTime?: string; // dateTime
    address?: Address[];
    maritalStatus?: CodeableConcept;
    multipleBirthBoolean?: boolean;
    multipleBirthInteger?: number;
    photo?: Attachment[];
    contact?: Contact[];
    communication?: Communication[];
    generalPractitioner?: Reference[];
    managingOrganization?: Reference;
    link?: Link[];
}
