import { httpResource } from "@angular/common/http";
import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CdaExplorerComponent } from "@kno2/ccdaview";
import { SelectModule } from "primeng/select";

const SAMPLE_DOCUMENTS = [
    "C-CDA_R2-1_CCD.xml",
    "C-CDA_R2_Care_Plan.xml",
    "CCD 1.xml",
    "Consult 1.xml",
    "DIR.sample.xml",
    "Discharge Summary 1.xml",
    "Final_Task_Force_Full_Sample_R1.1.xml",
    "HandP 1.xml",
    "Myra Jones_CCD.xml",
    "Op Note 1.xml",
    "Proc Note 1.xml",
    "Progress Note 1.xml",
    "Sample-p2.xml",
    "UD 1.xml",
    "UD 2.xml"
];

@Component({
    selector: "demo-root",
    imports: [FormsModule, SelectModule, CdaExplorerComponent],
    templateUrl: "./app.html",
    styleUrl: "./app.scss"
})
export class App {
    protected readonly documents = SAMPLE_DOCUMENTS;
    protected readonly selected = signal(SAMPLE_DOCUMENTS[0]);

    protected readonly content = httpResource.text(() => `docs/${encodeURIComponent(this.selected())}`);
}
