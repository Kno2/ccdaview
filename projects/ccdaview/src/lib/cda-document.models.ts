export interface CdaNonXmlBody {
    reference: string | null;
}

export interface CdaName {
    prefix: string | null;
    given: string[];
    family: string | null;
}

export interface CdaAddress {
    street: string[];
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
}

export interface CdaDemographics {
    name: CdaName;
    dob: Date | null;
    gender: string | null;
    maritalStatus: string | null;
    race: string | null;
    religion: string | null;
    language: string | null;
    address: CdaAddress;
    phone: string | null;
    guardian: { name: CdaName };
    providerOrganization: string | null;
}

export interface CdaSection {
    key: string;
    display: string;
    icon: string;
    templateId: string | null;
    narrative: Element | null;
}

export interface CdaDocument {
    templateId: string | null;
    title: string | null;
    demographics: CdaDemographics;
    sections: CdaSection[];
    nonXmlBody: CdaNonXmlBody | null;
}
