import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal, signal, viewChild } from "@angular/core";
import { AccordionModule } from "primeng/accordion";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { MessageModule } from "primeng/message";
import { PanelModule } from "primeng/panel";
import { ToolbarModule } from "primeng/toolbar";
import { CdaDocumentParserService } from "./cda-document-parser.service";
import { CdaName, CdaSection } from "./cda-document.models";
import { LANGUAGES_BY_CODE } from "./cda-languages";
import { CdaNarrativeDirective } from "./cda-narrative.directive";
import { CdaPreferencesPanelComponent } from "./cda-preferences-panel.component";
import { CdaPreferencesService, CdaSectionPreferences } from "./cda-preferences.service";

type CdaExplorerSection = CdaSection & { empty: boolean };

@Component({
    selector: "kno2-cda-explorer",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        DatePipe,
        AccordionModule,
        ButtonModule,
        MenuModule,
        MessageModule,
        PanelModule,
        ToolbarModule,
        CdaNarrativeDirective,
        CdaPreferencesPanelComponent
    ],
    templateUrl: "./cda-explorer.component.html",
    styleUrl: "./cda-explorer.component.scss"
})
export class CdaExplorerComponent {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly documentParser = inject(CdaDocumentParserService);
    private readonly preferencesService = inject(CdaPreferencesService);

    private readonly scrollBox = viewChild<ElementRef<HTMLElement>>("scrollBox");

    public readonly content = input.required<string>();

    protected readonly parsed = computed(() => {
        try {
            return { document: this.documentParser.parse(this.content()), error: null };
        } catch {
            return {
                document: null,
                error: "There was an error previewing the document. The retrieved document may contain content not supported in this view."
            };
        }
    });

    protected readonly document = computed(() => this.parsed().document);
    protected readonly error = computed(() => this.parsed().error);

    protected readonly preferences = linkedSignal(() => this.preferencesService.get(this.document()?.templateId ?? null));

    protected readonly orderedSections = computed(() => {
        const document = this.document();
        return document ? this.preferencesService.orderSections(document.sections, this.preferences()) : [];
    });

    protected readonly sections = computed<CdaExplorerSection[]>(() => {
        const preferences = this.preferences();
        const visible = preferences ? this.orderedSections().filter((section) => preferences.enabledSectionKeys.includes(section.key)) : this.orderedSections();
        return visible.map((section) => ({ ...section, empty: !section.narrative?.textContent?.trim() }));
    });

    protected readonly expandedKeys = linkedSignal<string[]>(() => {
        if (!this.preferences()) return [];
        return this.sections()
            .filter((section) => !section.empty)
            .map((section) => section.key);
    });

    protected readonly preferencesVisible = signal(false);
    protected readonly navOpen = signal(false);

    protected readonly jumpToItems = computed<MenuItem[]>(() => [
        { label: "Top", command: (): void => this.jumpToTop() },
        { separator: true },
        ...this.sections().map((section) => ({
            label: section.display,
            icon: `fa fa-${section.icon}`,
            command: (): void => this.jumpTo(section.key)
        }))
    ]);

    protected readonly patientName = computed(() => this.formatName(this.document()?.demographics.name));
    protected readonly guardianName = computed(() => this.formatName(this.document()?.demographics.guardian.name));

    protected readonly language = computed(() => {
        const code = this.document()?.demographics.language;
        return (code && LANGUAGES_BY_CODE[code.toLowerCase()]) || "an unknown language";
    });

    protected readonly phone = computed(() => {
        const raw = this.document()?.demographics.phone;
        if (!raw) return "";

        let digits = raw.replace(/\D/g, "");
        if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
        if (digits.length !== 10) return "";
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    });

    protected readonly hasAddress = computed(() => {
        const address = this.document()?.demographics.address;
        if (!address) return false;
        return !!(address.street[0] || address.city || address.state || address.zip);
    });

    protected jumpTo(key: string): void {
        this.host.nativeElement.querySelector(`[id="${key}"]`)?.scrollIntoView();
    }

    protected jumpToTop(): void {
        this.scrollBox()?.nativeElement.scrollTo({ top: 0 });
    }

    protected savePreferences(preferences: CdaSectionPreferences): void {
        this.preferencesService.save(this.document()?.templateId ?? null, preferences);
        this.preferences.set(preferences);
        this.preferencesVisible.set(false);
    }

    private formatName(name: CdaName | undefined): string {
        if (!name) return "";
        return [name.given[0], name.family].filter(Boolean).join(" ");
    }
}
