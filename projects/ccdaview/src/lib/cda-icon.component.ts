import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { CDA_ICONS } from "./cda-icons";

@Component({
    selector: "kno2-cda-icon",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            [innerHTML]="body()"></svg>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex: none;
            vertical-align: -0.125em;
        }
    `
})
export class CdaIconComponent {
    private readonly sanitizer = inject(DomSanitizer);

    public readonly name = input.required<string>();

    protected readonly body = computed<SafeHtml>(() => this.sanitizer.bypassSecurityTrustHtml(CDA_ICONS[this.name()] ?? CDA_ICONS["register-book"]));
}
