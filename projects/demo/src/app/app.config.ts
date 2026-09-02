import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import Lara from "@primeuix/themes/lara";
import { providePrimeNG } from "primeng/config";

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideHttpClient(),
        providePrimeNG({
            license: import.meta.env.CCDAVIEW_PRIMENG_LICENSE,
            theme: {
                preset: Lara,
                options: {
                    darkModeSelector: false
                }
            }
        })
    ]
};
