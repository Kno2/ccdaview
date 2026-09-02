import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { MessageModule } from "primeng/message";
import { CdaSection } from "./cda-document.models";
import { CdaSectionPreferences } from "./cda-preferences.service";

interface CdaPreferenceRow {
    key: string;
    display: string;
    icon: string;
    enabled: boolean;
}

@Component({
    selector: "kno2-cda-preferences-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, ButtonModule, CheckboxModule, MessageModule, CdkDrag, CdkDragHandle, CdkDropList],
    template: `
        <div class="cda-preferences">
            <div class="cda-preferences-header">
                <h2>
                    Which sections would you like to see?
                    <small>
                        <a
                            role="button"
                            (click)="setAll(true)">
                            all
                        </a>
                        |
                        <a
                            role="button"
                            (click)="setAll(false)">
                            none
                        </a>
                        (drag to sort)
                    </small>
                </h2>
                <p-button
                    label="Save"
                    (onClick)="save()" />
            </div>
            @if (!preferences()) {
                <p-message severity="info">
                    This is the first time you are setting up your section preferences for this document type. You can order and select sections that are
                    relevant for the care you are providing and we will save these for future use.
                </p-message>
            }
            <ul
                class="cda-preference-list"
                cdkDropList
                (cdkDropListDropped)="drop($event)">
                @for (row of rows(); track row.key) {
                    <li cdkDrag>
                        <span class="cda-preference-section">
                            <p-checkbox
                                [binary]="true"
                                [ngModel]="row.enabled"
                                (onChange)="toggle(row)" />
                            <span
                                class="cda-preference-label"
                                (click)="toggle(row)">
                                <i
                                    class="fa fa-{{ row.icon }}"
                                    aria-hidden="true"></i>
                                {{ row.display }}
                            </span>
                        </span>
                        <i
                            class="fa fa-bars"
                            cdkDragHandle
                            title="Drag to sort"></i>
                    </li>
                }
            </ul>
        </div>
    `,
    styles: `
        .cda-preferences-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 0.75rem;

            h2 {
                font-size: 2rem;
                line-height: 1.2;
                font-weight: 500;
                margin: 0;
            }

            small {
                font-size: 1rem;
                color: var(--p-text-muted-color, #71717a);

                a {
                    color: var(--p-primary-color, #3b82f6);
                    text-decoration: underline;
                    cursor: pointer;
                }
            }
        }

        p-message {
            display: block;
            margin-bottom: 0.75rem;
        }

        .cda-preference-list {
            list-style: none;
            margin: 0;
            padding: 0;
            border-top: 1px solid var(--p-surface-300, #dddddd);

            li {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 0.25rem;
                border-bottom: 1px solid var(--p-surface-300, #dddddd);
                background: var(--p-content-background, #ffffff);
            }

            .cda-preference-section {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }

            .cda-preference-label {
                cursor: pointer;

                i {
                    width: 1rem;
                    text-align: center;
                    color: var(--p-text-muted-color, #71717a);
                }
            }

            .fa-bars {
                cursor: grab;
                color: var(--p-text-muted-color, #71717a);
            }
        }
    `
})
export class CdaPreferencesPanelComponent {
    public readonly sections = input.required<CdaSection[]>();
    public readonly preferences = input.required<CdaSectionPreferences | null>();
    public readonly savePreferences = output<CdaSectionPreferences>();

    protected readonly rows = linkedSignal(() =>
        this.sections().map((section) => ({
            key: section.key,
            display: section.display,
            icon: section.icon,
            enabled: this.preferences()?.enabledSectionKeys.includes(section.key) ?? true
        }))
    );

    protected toggle(row: CdaPreferenceRow): void {
        this.rows.set(this.rows().map((r) => (r.key === row.key ? { ...r, enabled: !r.enabled } : r)));
    }

    protected setAll(enabled: boolean): void {
        this.rows.set(this.rows().map((r) => ({ ...r, enabled })));
    }

    protected drop(event: CdkDragDrop<unknown>): void {
        const rows = [...this.rows()];
        moveItemInArray(rows, event.previousIndex, event.currentIndex);
        this.rows.set(rows);
    }

    protected save(): void {
        this.savePreferences.emit({
            enabledSectionKeys: this.rows()
                .filter((row) => row.enabled)
                .map((row) => row.key),
            sortedSectionKeys: this.rows().map((row) => row.key)
        });
    }
}
