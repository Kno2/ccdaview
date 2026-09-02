import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CdaDocumentParserService } from "./cda-document-parser.service";

const service = new CdaDocumentParserService();
const fixture = (name: string): string => readFileSync(join(process.cwd(), "projects/ccdaview/src/lib/testing", name), "utf-8");

describe("CdaDocumentParserService", () => {
    describe("R2.1 CCD (generic section keys)", () => {
        const doc = service.parse(fixture("ccd-r21.xml"));

        it("identifies the document by its header templateId", () => {
            expect(doc.templateId).toBe("2.16.840.1.113883.10.20.22.1.2");
        });

        it("parses the document title", () => {
            expect(doc.title).toBe("Patient Chart Summary");
        });

        it("parses demographics", () => {
            expect(doc.demographics).toEqual({
                name: { prefix: null, given: ["Eve"], family: "Betterhalf" },
                dob: new Date(1975, 4, 1),
                gender: "female",
                maritalStatus: "married",
                race: "White",
                religion: "Christian (non-Catholic, non-specific)",
                language: "en",
                address: { street: ["2222 Home Street"], city: "Beaverton", state: "OR", zip: "97867", country: "US" },
                phone: "tel:+1(555)555-2003",
                guardian: { name: { prefix: null, given: ["Boris", "Bo"], family: "Betterhalf" } },
                providerOrganization: "The DoctorsTogether Physician Group"
            });
        });

        it("keys sections by templateId, deduplicating repeats", () => {
            expect(doc.sections.map((s) => s.key)).toEqual([
                "advance_directives",
                "allergies",
                "encounters",
                "family_history",
                "functional_statuses",
                "immunizations",
                "medical_equipment",
                "medications",
                "payers",
                "care_plan",
                "problems",
                "procedures",
                "results",
                "social_history",
                "vitals"
            ]);
        });

        it("uses known display and icon when the key is recognized, otherwise asterisk", () => {
            const results = doc.sections.find((s) => s.key === "results");
            const socialHistory = doc.sections.find((s) => s.key === "social_history");
            expect(results).toMatchObject({ display: "Results", icon: "flask" });
            expect(socialHistory).toMatchObject({ display: "Social History", icon: "asterisk" });
        });

        it("captures each section's narrative element", () => {
            const medications = doc.sections.find((s) => s.key === "medications")!;
            expect(medications.narrative!.localName).toBe("text");
            expect(medications.narrative!.textContent).toContain("Atenolol 25 MG Oral Tablet");
        });

        it("has no non-XML body", () => {
            expect(doc.nonXmlBody).toBeNull();
        });
    });

    describe("R1.1 CCD", () => {
        const doc = service.parse(fixture("ccd-r11.xml"));

        it("identifies the document by the second header templateId", () => {
            expect(doc.templateId).toBe("2.16.840.1.113883.10.20.22.1.2");
        });

        it("keys sections by templateId ahead of displayName", () => {
            expect(doc.sections.map((s) => s.key)).toEqual([
                "advance_directives",
                "allergies",
                "assessment",
                "encounters",
                "family_history",
                "functional_statuses",
                "immunizations",
                "interventions",
                "medical_equipment",
                "medications",
                "payers",
                "care_plan",
                "problems",
                "procedures",
                "results",
                "social_history",
                "vitals"
            ]);
        });
    });

    describe("unstructured document", () => {
        const doc = service.parse(fixture("unstructured.xml"));

        it("parses the referenced attachment", () => {
            expect(doc.nonXmlBody).toEqual({ reference: "UD_sample.pdf" });
        });

        it("has no sections", () => {
            expect(doc.sections).toEqual([]);
        });
    });

    it.each([
        { name: "not XML", xml: "just some text" },
        { name: "malformed XML", xml: "<ClinicalDocument><unclosed></ClinicalDocument>" },
        { name: "not a clinical document", xml: "<html><body>hi</body></html>" }
    ])("throws for $name", ({ xml }) => {
        expect(() => service.parse(xml)).toThrow("The file is not a valid clinical document.");
    });
});
