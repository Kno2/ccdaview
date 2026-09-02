import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CdaSection } from "./cda-document.models";
import { CdaPreferencesPanelComponent } from "./cda-preferences-panel.component";
import { CdaSectionPreferences } from "./cda-preferences.service";

@Component({ template: "" })
class CdaPreferencesPanelComponentWrapper extends CdaPreferencesPanelComponent {
    public readonly rowsValue = this.rows;
    public readonly toggleRow = this.toggle.bind(this);
    public readonly setAllRows = this.setAll.bind(this);
    public readonly dropRow = this.drop.bind(this);
    public readonly saveRows = this.save.bind(this);
}

describe("CdaPreferencesPanelComponent", () => {
    let fixture: ComponentFixture<CdaPreferencesPanelComponentWrapper>;
    let component: CdaPreferencesPanelComponentWrapper;

    const sections: CdaSection[] = [
        { key: "allergies", display: "Allergies", icon: "pagelines", templateId: null, narrative: null },
        { key: "medications", display: "Medications", icon: "medkit", templateId: null, narrative: null },
        { key: "vitals", display: "Vitals", icon: "heartbeat", templateId: null, narrative: null }
    ];

    const create = (preferences: CdaSectionPreferences | null): void => {
        fixture = TestBed.createComponent(CdaPreferencesPanelComponentWrapper);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("sections", sections);
        fixture.componentRef.setInput("preferences", preferences);
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [CdaPreferencesPanelComponentWrapper] });
    });

    it("enables every section when there are no saved preferences", () => {
        create(null);

        expect(component.rowsValue().map((row) => row.enabled)).toEqual([true, true, true]);
    });

    it("enables only the saved sections", () => {
        create({ enabledSectionKeys: ["vitals"], sortedSectionKeys: [] });

        expect(component.rowsValue().map((row) => row.enabled)).toEqual([false, false, true]);
    });

    it("toggles a single row", () => {
        create(null);

        component.toggleRow(component.rowsValue()[1]);

        expect(component.rowsValue().map((row) => row.enabled)).toEqual([true, false, true]);
    });

    it.each([{ enabled: true }, { enabled: false }])("sets all rows to $enabled", ({ enabled }) => {
        create(null);

        component.setAllRows(enabled);

        expect(component.rowsValue().every((row) => row.enabled === enabled)).toBe(true);
    });

    it("reorders rows on drop", () => {
        create(null);

        component.dropRow({ previousIndex: 2, currentIndex: 0 } as CdkDragDrop<unknown>);

        expect(component.rowsValue().map((row) => row.key)).toEqual(["vitals", "allergies", "medications"]);
    });

    it("emits the checked keys and full sort order on save", () => {
        create({ enabledSectionKeys: ["allergies", "vitals"], sortedSectionKeys: [] });
        const saved = vi.fn();
        component.savePreferences.subscribe(saved);

        component.dropRow({ previousIndex: 0, currentIndex: 2 } as CdkDragDrop<unknown>);
        component.saveRows();

        expect(saved).toHaveBeenCalledWith({
            enabledSectionKeys: ["vitals", "allergies"],
            sortedSectionKeys: ["medications", "vitals", "allergies"]
        });
    });
});
