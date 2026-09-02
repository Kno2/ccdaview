import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CdaExplorerComponent } from "./cda-explorer.component";

@Component({ template: "" })
class CdaExplorerComponentWrapper extends CdaExplorerComponent {
    public readonly documentValue = this.document;
    public readonly errorValue = this.error;
    public readonly sectionsValue = this.sections;
    public readonly expandedKeysValue = this.expandedKeys;
    public readonly patientNameValue = this.patientName;
    public readonly languageValue = this.language;
    public readonly phoneValue = this.phone;
    public readonly saveFromPanel = this.savePreferences.bind(this);
    public readonly preferencesVisibleValue = this.preferencesVisible;
}

const fixtureXml = (name: string): string => readFileSync(join(process.cwd(), "projects/ccdaview/src/lib/testing", name), "utf-8");

describe("CdaExplorerComponent", () => {
    let fixture: ComponentFixture<CdaExplorerComponentWrapper>;
    let component: CdaExplorerComponentWrapper;

    const createWithContent = (content: string): void => {
        fixture = TestBed.createComponent(CdaExplorerComponentWrapper);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("content", content);
    };

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({ imports: [CdaExplorerComponentWrapper] });
    });

    it("surfaces a parse error instead of a document", () => {
        createWithContent("not a cda");

        expect(component.documentValue()).toBeNull();
        expect(component.errorValue()).toBe(
            "There was an error previewing the document. The retrieved document may contain content not supported in this view."
        );
    });

    it("parses the document and formats the patient demographics", () => {
        createWithContent(fixtureXml("ccd-r21.xml"));

        expect(component.errorValue()).toBeNull();
        expect(component.documentValue()?.title).toBe("Patient Chart Summary");
        expect(component.patientNameValue()).toBe("Eve Betterhalf");
        expect(component.languageValue()).toBe("English");
        expect(component.phoneValue()).toBe("(555) 555-2003");
    });

    it("shows all sections collapsed and alphabetized when no preferences are saved", () => {
        createWithContent(fixtureXml("ccd-r21.xml"));

        const displays = component.sectionsValue().map((s) => s.display);
        expect(displays).toEqual([...displays].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
        expect(component.sectionsValue()).toHaveLength(15);
        expect(component.expandedKeysValue()).toEqual([]);
    });

    it("shows only enabled sections, expanded and in saved order, when preferences exist", () => {
        localStorage.setItem(
            "cda-preferences.2.16.840.1.113883.10.20.22.1.2",
            JSON.stringify({ enabledSectionKeys: ["vitals", "medications"], sortedSectionKeys: ["vitals", "medications"] })
        );
        createWithContent(fixtureXml("ccd-r21.xml"));

        expect(component.sectionsValue().map((s) => s.key)).toEqual(["vitals", "medications"]);
        expect(component.expandedKeysValue()).toEqual(["vitals", "medications"]);
    });

    it("persists saved preferences, applies them, and closes the panel", () => {
        createWithContent(fixtureXml("ccd-r21.xml"));
        component.preferencesVisibleValue.set(true);
        const preferences = { enabledSectionKeys: ["vitals"], sortedSectionKeys: ["vitals"] };

        component.saveFromPanel(preferences);

        expect(localStorage.getItem("cda-preferences.2.16.840.1.113883.10.20.22.1.2")).toBe(JSON.stringify(preferences));
        expect(component.sectionsValue().map((s) => s.key)).toEqual(["vitals"]);
        expect(component.expandedKeysValue()).toEqual(["vitals"]);
        expect(component.preferencesVisibleValue()).toBe(false);
    });

    it("exposes the non-XML body reference for unstructured documents", () => {
        createWithContent(fixtureXml("unstructured.xml"));

        expect(component.documentValue()?.nonXmlBody).toEqual({ reference: "UD_sample.pdf" });
        expect(component.sectionsValue()).toEqual([]);
    });
});
