import { DOCUMENT, inject, Injectable } from "@angular/core";

const PASSTHROUGH_TAGS = new Set(["table", "thead", "tbody", "tfoot", "tr", "th", "td", "col", "colgroup", "caption", "br", "sub", "sup"]);

const RENAMED_TAGS: Record<string, string> = {
    paragraph: "p",
    item: "li",
    content: "span",
    footnote: "span",
    linkhtml: "a"
};

const DROPPED_TAGS = new Set(["script", "style", "rendermultimedia"]);

const STYLE_CODE_CLASSES: Record<string, string> = {
    bold: "cda-bold",
    italics: "cda-italics",
    underline: "cda-underline",
    emphasis: "cda-emphasis"
};

@Injectable({
    providedIn: "root"
})
export class CdaNarrativeRendererService {
    private readonly document = inject(DOCUMENT);

    public render(narrative: Element | null): DocumentFragment {
        const fragment = this.document.createDocumentFragment();
        if (narrative) this.appendChildren(narrative, fragment);
        return fragment;
    }

    private appendChildren(source: Node, target: Node): void {
        for (const node of Array.from(source.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                target.appendChild(this.document.createTextNode(node.textContent ?? ""));
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                this.appendElement(node as Element, target);
            }
        }
    }

    private appendElement(el: Element, target: Node): void {
        const tag = el.localName.toLowerCase();
        if (DROPPED_TAGS.has(tag)) return;

        const htmlTag = this.resolveHtmlTag(el, tag);
        if (!htmlTag) {
            this.appendChildren(el, target);
            return;
        }

        const rendered = this.document.createElement(htmlTag);
        this.copyAttributes(el, rendered, tag);
        target.appendChild(rendered);
        this.appendChildren(el, rendered);
    }

    private resolveHtmlTag(el: Element, tag: string): string | null {
        if (tag === "list") return el.getAttribute("listType") === "ordered" ? "ol" : "ul";
        if (RENAMED_TAGS[tag]) return RENAMED_TAGS[tag];
        return PASSTHROUGH_TAGS.has(tag) ? tag : null;
    }

    private copyAttributes(el: Element, rendered: HTMLElement, tag: string): void {
        const id = el.getAttribute("ID");
        if (id) rendered.id = id;

        const classes = this.resolveClasses(el, tag);
        if (classes.length) rendered.className = classes.join(" ");

        if (tag === "td" || tag === "th") {
            const colspan = el.getAttribute("colspan");
            const rowspan = el.getAttribute("rowspan");
            if (colspan) rendered.setAttribute("colspan", colspan);
            if (rowspan) rendered.setAttribute("rowspan", rowspan);
        }

        if (tag === "linkhtml") {
            const href = el.getAttribute("href")?.trim();
            if (href && /^(https?:|#)/i.test(href)) rendered.setAttribute("href", href);
        }
    }

    private resolveClasses(el: Element, tag: string): string[] {
        const classes = tag === "table" ? ["cda-table"] : [];

        for (const token of el.getAttribute("styleCode")?.split(/\s+/) ?? []) {
            const styleClass = STYLE_CODE_CLASSES[token.toLowerCase()];
            if (styleClass && !classes.includes(styleClass)) classes.push(styleClass);
        }

        const revised = el.getAttribute("revised")?.toLowerCase();
        if (revised === "delete" || revised === "insert") classes.push(`cda-revised-${revised}`);

        return classes;
    }
}
