import { DOCUMENT, inject, Injectable } from "@angular/core";
import { CdaSection } from "./cda-document.models";

export interface CdaSectionPreferences {
    enabledSectionKeys: string[];
    sortedSectionKeys: string[];
}

@Injectable({
    providedIn: "root"
})
export class CdaPreferencesService {
    private readonly storage = inject(DOCUMENT).defaultView?.localStorage;

    public get(templateId: string | null): CdaSectionPreferences | null {
        if (!templateId || !this.storage) return null;
        return this.normalize(this.storage.getItem(this.key(templateId)));
    }

    public save(templateId: string | null, preferences: CdaSectionPreferences): void {
        if (!templateId || !this.storage) return;
        this.storage.setItem(this.key(templateId), JSON.stringify(preferences));
    }

    public orderSections(sections: CdaSection[], preferences: CdaSectionPreferences | null): CdaSection[] {
        const ordered = [...sections].sort((a, b) => {
            const left = a.display.toLowerCase();
            const right = b.display.toLowerCase();
            return left < right ? -1 : left > right ? 1 : 0;
        });

        if (!preferences) return ordered;

        return ordered.sort((a, b) => preferences.sortedSectionKeys.indexOf(a.key) - preferences.sortedSectionKeys.indexOf(b.key));
    }

    private normalize(json: string | null): CdaSectionPreferences | null {
        if (!json) return null;

        let candidate: CdaSectionPreferences;
        try {
            candidate = JSON.parse(json) as CdaSectionPreferences;
        } catch {
            return null;
        }

        if (!candidate || !Array.isArray(candidate.enabledSectionKeys) || !Array.isArray(candidate.sortedSectionKeys)) return null;
        return { enabledSectionKeys: candidate.enabledSectionKeys, sortedSectionKeys: candidate.sortedSectionKeys };
    }

    private key(templateId: string): string {
        return `cda-preferences.${templateId}`;
    }
}
