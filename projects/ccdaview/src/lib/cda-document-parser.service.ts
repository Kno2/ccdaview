import { Injectable } from "@angular/core";
import { CdaAddress, CdaDemographics, CdaDocument, CdaName, CdaNonXmlBody, CdaSection } from "./cda-document.models";

const SECTION_KEYS_BY_TEMPLATE_ID: Record<string, string> = {
    "2.16.840.1.113883.10.20.22.2.6.1": "allergies",
    "2.16.840.1.113883.10.20.22.2.6": "allergies",
    "2.16.840.1.113883.10.20.22.2.10": "care_plan",
    "2.16.840.1.113883.10.20.22.2.13": "chief_complaint",
    "1.3.6.1.4.1.19376.1.5.3.1.1.13.2.1": "chief_complaint",
    "2.16.840.1.113883.10.20.22.2.22": "encounters",
    "2.16.840.1.113883.10.20.22.2.22.1": "encounters",
    "2.16.840.1.113883.10.20.22.2.14": "functional_statuses",
    "2.16.840.1.113883.10.20.22.2.2.1": "immunizations",
    "2.16.840.1.113883.10.20.22.2.2": "immunizations",
    "2.16.840.1.113883.10.20.22.2.45": "instructions",
    "2.16.840.1.113883.10.20.22.2.1.1": "medications",
    "2.16.840.1.113883.10.20.22.2.1": "medications",
    "2.16.840.1.113883.10.20.22.2.5.1": "problems",
    "2.16.840.1.113883.10.20.22.2.5": "problems",
    "2.16.840.1.113883.10.20.22.2.7.1": "procedures",
    "2.16.840.1.113883.10.20.22.2.7": "procedures",
    "2.16.840.1.113883.10.20.22.2.3.1": "results",
    "2.16.840.1.113883.10.20.22.2.3": "results",
    "2.16.840.1.113883.10.20.22.2.4.1": "vitals",
    "2.16.840.1.113883.10.20.22.2.4": "vitals",
    "2.16.840.1.113883.10.20.22.2.58": "health_concerns_document",
    "2.16.840.1.113883.10.20.22.2.21": "advance_directives",
    "2.16.840.1.113883.10.20.22.2.21.1": "advance_directives",
    "2.16.840.1.113883.10.20.22.2.15": "family_history",
    "2.16.840.1.113883.10.20.22.2.23": "medical_equipment",
    "2.16.840.1.113883.10.20.22.2.17": "social_history",
    "2.16.840.1.113883.10.20.22.2.18": "payers",
    "2.16.840.1.113883.10.20.22.2.60": "goals",
    "2.16.840.1.113883.10.20.21.2.3": "interventions",
    "2.16.840.1.113883.10.20.22.2.61": "health_status_outcomes"
};

export const SECTION_META_BY_KEY: Record<string, { display: string; icon?: string }> = {
    allergies: { display: "Allergies", icon: "pagelines" },
    care_plan: { display: "Care Plan", icon: "sticky-note-o" },
    chief_complaint: { display: "Chief Complaint", icon: "bullhorn" },
    encounters: { display: "Encounters", icon: "stethoscope" },
    functional_statuses: { display: "Functional Status", icon: "wheelchair" },
    immunizations: { display: "Immunizations", icon: "eyedropper" },
    instructions: { display: "Patient Instructions", icon: "user-md" },
    medications: { display: "Medications", icon: "medkit" },
    problems: { display: "Problems", icon: "exclamation-triangle" },
    procedures: { display: "Procedures", icon: "hospital-o" },
    results: { display: "Results", icon: "flask" },
    smoking_status: { display: "Smoking Status", icon: "fire" },
    vitals: { display: "Vitals", icon: "heartbeat" },
    advance_directives: { display: "Advance Directives" },
    family_history: { display: "Family History" },
    medical_equipment: { display: "Medical Equipment" },
    social_history: { display: "Social History" },
    payers: { display: "Payers" },
    goals: { display: "Goals" },
    interventions: { display: "Interventions" },
    health_status_outcomes: { display: "Health Status Outcomes" }
};

const GENDERS: Record<string, string> = {
    F: "female",
    M: "male",
    UN: "undifferentiated"
};

const MARITAL_STATUSES: Record<string, string> = {
    N: "annulled",
    C: "common law",
    D: "divorced",
    P: "domestic partner",
    I: "interlocutory",
    E: "legally separated",
    G: "living together",
    M: "married",
    O: "other",
    R: "registered domestic partner",
    A: "separated",
    S: "single",
    U: "unknown",
    B: "unmarried",
    T: "unreported",
    W: "widowed"
};

@Injectable({
    providedIn: "root"
})
export class CdaDocumentParserService {
    public parse(xml: string): CdaDocument {
        const doc = new DOMParser().parseFromString(xml, "application/xml");

        if (doc.getElementsByTagNameNS("*", "parsererror").length > 0 || doc.documentElement.localName !== "ClinicalDocument") {
            throw new Error("The file is not a valid clinical document.");
        }

        const root = doc.documentElement;
        const templateIds = Array.from(root.getElementsByTagNameNS("*", "templateId"))
            .map((el) => el.getAttribute("root"))
            .filter((id): id is string => !!id);

        return {
            templateId: templateIds[1] ?? templateIds[0] ?? null,
            title: this.collapseWhitespace(this.textOf(this.firstByTag(root, "title"))),
            demographics: this.parseDemographics(root),
            sections: this.parseSections(root),
            nonXmlBody: this.parseNonXmlBody(root)
        };
    }

    private parseSections(root: Element): CdaSection[] {
        const sections: CdaSection[] = [];
        const seenKeys = new Set<string>();

        for (const sectionEl of Array.from(root.getElementsByTagNameNS("*", "section"))) {
            const templateIds = this.directChildren(sectionEl, "templateId")
                .map((el) => el.getAttribute("root"))
                .filter((id): id is string => !!id);
            const displayName = this.attrOf(this.directChild(sectionEl, "code"), "displayName");
            const knownKey = templateIds.map((id) => SECTION_KEYS_BY_TEMPLATE_ID[id]).find((key) => !!key);
            const key = knownKey ?? (displayName ? displayName.split(" ").join("_").toLowerCase() : null);

            if (!key || seenKeys.has(key)) continue;
            seenKeys.add(key);

            const meta = SECTION_META_BY_KEY[key];
            sections.push({
                key,
                display: meta?.display ?? displayName ?? key,
                icon: meta?.icon ?? "asterisk",
                templateId: templateIds[0] ?? null,
                narrative: this.directChild(sectionEl, "text")
            });
        }

        return sections;
    }

    private parseDemographics(root: Element): CdaDemographics {
        const patientRole = this.firstByTag(root, "patientRole");
        const patient = this.firstByTag(patientRole, "patient");
        const guardian = this.firstByTag(patient, "guardian");
        const providerOrganization = this.firstByTag(patientRole, "providerOrganization");

        return {
            name: this.parseName(this.firstByTag(patient, "name")),
            dob: this.parseDate(this.attrOf(this.firstByTag(patient, "birthTime"), "value")),
            gender: GENDERS[this.attrOf(this.firstByTag(patient, "administrativeGenderCode"), "code") ?? ""] ?? null,
            maritalStatus: MARITAL_STATUSES[this.attrOf(this.firstByTag(patient, "maritalStatusCode"), "code") ?? ""] ?? null,
            race: this.attrOf(this.firstByTag(patient, "raceCode"), "displayName"),
            religion: this.attrOf(this.firstByTag(patient, "religiousAffiliationCode"), "displayName"),
            language: this.attrOf(this.firstByTag(this.firstByTag(patient, "languageCommunication"), "languageCode"), "code"),
            address: this.parseAddress(this.firstByTag(patientRole, "addr")),
            phone: this.attrOf(this.firstByTag(patientRole, "telecom"), "value"),
            guardian: { name: this.parseName(this.firstByTag(this.firstByTag(guardian, "guardianPerson"), "name")) },
            providerOrganization: this.textOf(this.firstByTag(providerOrganization, "name"))
        };
    }

    private parseName(nameEl: Element | null): CdaName {
        return {
            prefix: this.textOf(this.firstByTag(nameEl, "prefix")),
            given: Array.from(nameEl?.getElementsByTagNameNS("*", "given") ?? [])
                .map((el) => this.textOf(el))
                .filter((val): val is string => !!val),
            family: this.textOf(this.firstByTag(nameEl, "family"))
        };
    }

    private parseAddress(addrEl: Element | null): CdaAddress {
        return {
            street: Array.from(addrEl?.getElementsByTagNameNS("*", "streetAddressLine") ?? [])
                .map((el) => this.textOf(el))
                .filter((val): val is string => !!val),
            city: this.textOf(this.firstByTag(addrEl, "city")),
            state: this.textOf(this.firstByTag(addrEl, "state")),
            zip: this.textOf(this.firstByTag(addrEl, "postalCode")),
            country: this.textOf(this.firstByTag(addrEl, "country"))
        };
    }

    private parseNonXmlBody(root: Element): CdaNonXmlBody | null {
        const nonXmlBody = this.firstByTag(root, "nonXMLBody");
        if (!nonXmlBody) return null;

        return { reference: this.attrOf(this.firstByTag(this.firstByTag(nonXmlBody, "text"), "reference"), "value") };
    }

    private firstByTag(scope: Element | null, tag: string): Element | null {
        return scope?.getElementsByTagNameNS("*", tag)[0] ?? null;
    }

    private directChild(el: Element, tag: string): Element | null {
        return this.directChildren(el, tag)[0] ?? null;
    }

    private directChildren(el: Element, tag: string): Element[] {
        return Array.from(el.children).filter((child) => child.localName === tag);
    }

    private attrOf(el: Element | null, name: string): string | null {
        return el?.getAttribute(name) || null;
    }

    private textOf(el: Element | null): string | null {
        return el?.textContent?.trim() || null;
    }

    private parseDate(value: string | null): Date | null {
        if (!value || value.length < 4) return null;

        const year = +value.slice(0, 4);
        const month = +(value.slice(4, 6) || "1") - 1;
        const day = +(value.slice(6, 8) || "1");
        if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;

        return new Date(year, month, day);
    }

    private collapseWhitespace(value: string | null): string | null {
        return value?.replace(/\s+/g, " ").trim() || null;
    }
}
