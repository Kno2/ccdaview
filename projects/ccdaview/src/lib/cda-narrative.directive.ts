import { afterRenderEffect, Directive, ElementRef, inject, input } from "@angular/core";
import { CdaNarrativeRendererService } from "./cda-narrative-renderer.service";

@Directive({
    selector: "[kno2CdaNarrative]"
})
export class CdaNarrativeDirective {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly narrativeRenderer = inject(CdaNarrativeRendererService);

    public readonly narrative = input.required<Element | null>({ alias: "kno2CdaNarrative" });

    public constructor() {
        afterRenderEffect(() => {
            this.host.nativeElement.replaceChildren(this.narrativeRenderer.render(this.narrative()));
        });
    }
}
