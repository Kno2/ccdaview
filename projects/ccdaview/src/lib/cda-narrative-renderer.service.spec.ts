import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TestBed } from "@angular/core/testing";
import { CdaDocumentParserService } from "./cda-document-parser.service";
import { CdaNarrativeRendererService } from "./cda-narrative-renderer.service";

describe("CdaNarrativeRendererService", () => {
    let service: CdaNarrativeRendererService;

    const narrative = (inner: string): Element =>
        new DOMParser().parseFromString(`<text xmlns="urn:hl7-org:v3">${inner}</text>`, "application/xml").documentElement;

    const renderToHtml = (el: Element | null): string => {
        const container = document.createElement("div");
        container.append(service.render(el));
        return container.innerHTML;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CdaNarrativeRendererService);
    });

    it("returns an empty fragment for a missing narrative", () => {
        expect(renderToHtml(null)).toBe("");
    });

    it.each([
        {
            name: "tables get the cda-table class and lose width/border/xmlns",
            inner: '<table width="100%" border="1"><thead><tr><th>Med</th></tr></thead><tbody><tr><td>Atenolol</td></tr></tbody></table>',
            expected: '<table class="cda-table"><thead><tr><th>Med</th></tr></thead><tbody><tr><td>Atenolol</td></tr></tbody></table>'
        },
        {
            name: "paragraph becomes p",
            inner: "<paragraph>Stable</paragraph>",
            expected: "<p>Stable</p>"
        },
        {
            name: "content becomes span with styleCode classes",
            inner: '<content styleCode="Bold Italics xNope">warning</content>',
            expected: '<span class="cda-bold cda-italics">warning</span>'
        },
        {
            name: "revised content is flagged",
            inner: '<content revised="delete">old dose</content>',
            expected: '<span class="cda-revised-delete">old dose</span>'
        },
        {
            name: "unordered list",
            inner: "<list><item>one</item><item>two</item></list>",
            expected: "<ul><li>one</li><li>two</li></ul>"
        },
        {
            name: "ordered list",
            inner: '<list listType="ordered"><item>first</item></list>',
            expected: "<ol><li>first</li></ol>"
        },
        {
            name: "internal linkHtml keeps its fragment href",
            inner: '<linkHtml href="#section-1">jump</linkHtml>',
            expected: '<a href="#section-1">jump</a>'
        },
        {
            name: "ID becomes an anchor id",
            inner: '<content ID="allergy-1">penicillin</content>',
            expected: '<span id="allergy-1">penicillin</span>'
        },
        {
            name: "td colspan and rowspan survive",
            inner: '<table><tbody><tr><td colspan="2" rowspan="3" align="left">x</td></tr></tbody></table>',
            expected: '<table class="cda-table"><tbody><tr><td colspan="2" rowspan="3">x</td></tr></tbody></table>'
        },
        {
            name: "br, sub and sup pass through",
            inner: "a<br/><sub>b</sub><sup>c</sup>",
            expected: "a<br><sub>b</sub><sup>c</sup>"
        },
        {
            name: "footnote becomes span",
            inner: "<footnote>see chart</footnote>",
            expected: "<span>see chart</span>"
        },
        {
            name: "unknown elements are unwrapped",
            inner: "<observationMedia><caption>image caption</caption></observationMedia>",
            expected: "<caption>image caption</caption>"
        },
        {
            name: "renderMultiMedia is dropped",
            inner: '<paragraph>before</paragraph><renderMultiMedia referencedObject="img1"><caption>x</caption></renderMultiMedia>',
            expected: "<p>before</p>"
        },
        {
            name: "script elements are dropped without leaking their body",
            inner: '<script>alert("x")</script><paragraph>safe</paragraph>',
            expected: "<p>safe</p>"
        },
        {
            name: "event handler attributes are dropped",
            inner: '<content onclick="alert(1)" onmouseover="alert(2)">click me</content>',
            expected: "<span>click me</span>"
        },
        {
            name: "javascript hrefs are dropped",
            inner: "<linkHtml href=\"javascript:alert('x')\">bad</linkHtml>",
            expected: "<a>bad</a>"
        }
    ])("$name", ({ inner, expected }) => {
        expect(renderToHtml(narrative(inner))).toBe(expected);
    });

    it("renders a real narrative from a parsed document", () => {
        const xml = readFileSync(join(process.cwd(), "projects/ccdaview/src/lib/testing", "ccd-r21.xml"), "utf-8");
        const doc = new CdaDocumentParserService().parse(xml);
        const medications = doc.sections.find((s) => s.key === "medications")!;

        const html = renderToHtml(medications.narrative);

        expect(html).toContain('<table class="cda-table">');
        expect(html).toContain("Atenolol 25 MG Oral Tablet");
        expect(html).not.toContain("xmlns");
    });
});
