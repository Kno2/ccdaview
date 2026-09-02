import { TestBed } from "@angular/core/testing";
import { CdaSection } from "./cda-document.models";
import { CdaPreferencesService, CdaSectionPreferences } from "./cda-preferences.service";

describe("CdaPreferencesService", () => {
    let service: CdaPreferencesService;

    const templateId = "2.16.840.1.113883.10.20.22.1.2";
    const storageKey = `cda-preferences.${templateId}`;
    const preferences: CdaSectionPreferences = {
        enabledSectionKeys: ["results", "vitals"],
        sortedSectionKeys: ["vitals", "results", "allergies"]
    };

    const section = (key: string, display: string): CdaSection => ({ key, display, icon: "asterisk", templateId: null, narrative: null });

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        service = TestBed.inject(CdaPreferencesService);
    });

    it("returns null when nothing is stored", () => {
        expect(service.get(templateId)).toBeNull();
    });

    it("returns null for a missing templateId", () => {
        expect(service.get(null)).toBeNull();
    });

    it("round-trips saved preferences under the cda-preferences key", () => {
        service.save(templateId, preferences);

        expect(localStorage.getItem(storageKey)).toBe(JSON.stringify(preferences));
        expect(service.get(templateId)).toEqual(preferences);
    });

    it.each([
        { name: "not JSON", stored: "not json" },
        { name: "missing key arrays", stored: JSON.stringify({ isSet: true }) }
    ])("ignores stored values that are $name", ({ stored }) => {
        localStorage.setItem(storageKey, stored);
        expect(service.get(templateId)).toBeNull();
    });

    it("orders sections alphabetically when there are no preferences", () => {
        const sections = [section("vitals", "Vitals"), section("allergies", "Allergies"), section("results", "Results")];

        expect(service.orderSections(sections, null).map((s) => s.key)).toEqual(["allergies", "results", "vitals"]);
    });

    it("applies the saved sort order after the alphabetical pass", () => {
        const sections = [section("allergies", "Allergies"), section("results", "Results"), section("vitals", "Vitals")];

        expect(service.orderSections(sections, preferences).map((s) => s.key)).toEqual(["vitals", "results", "allergies"]);
    });

    it("floats sections missing from the saved order to the top, alphabetically", () => {
        const sections = [section("results", "Results"), section("problems", "Problems"), section("care_plan", "Care Plan")];
        const saved = { enabledSectionKeys: [], sortedSectionKeys: ["results"] };

        expect(service.orderSections(sections, saved).map((s) => s.key)).toEqual(["care_plan", "problems", "results"]);
    });

    it("does not mutate the input section order", () => {
        const sections = [section("vitals", "Vitals"), section("allergies", "Allergies")];
        service.orderSections(sections, preferences);

        expect(sections.map((s) => s.key)).toEqual(["vitals", "allergies"]);
    });
});
