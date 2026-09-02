import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { definePreset } from "@primeuix/themes";
import Lara from "@primeuix/themes/lara";
import { providePrimeNG } from "primeng/config";

const NoirLara = definePreset(Lara, {
    semantic: {
        primary: {
            50: "{zinc.50}",
            100: "{zinc.100}",
            200: "{zinc.200}",
            300: "{zinc.300}",
            400: "{zinc.400}",
            500: "{zinc.500}",
            600: "{zinc.600}",
            700: "{zinc.700}",
            800: "{zinc.800}",
            900: "{zinc.900}",
            950: "{zinc.950}"
        },
        colorScheme: {
            light: {
                primary: {
                    color: "{zinc.950}",
                    contrastColor: "#ffffff",
                    hoverColor: "{zinc.900}",
                    activeColor: "{zinc.800}"
                },
                highlight: {
                    background: "{zinc.950}",
                    focusBackground: "{zinc.700}",
                    color: "#ffffff",
                    focusColor: "#ffffff"
                }
            },
            dark: {
                primary: {
                    color: "{zinc.50}",
                    contrastColor: "{zinc.950}",
                    hoverColor: "{zinc.100}",
                    activeColor: "{zinc.200}"
                },
                highlight: {
                    background: "rgba(250, 250, 250, 0.16)",
                    focusBackground: "rgba(250, 250, 250, 0.24)",
                    color: "rgba(255, 255, 255, 0.87)",
                    focusColor: "rgba(255, 255, 255, 0.87)"
                }
            }
        }
    }
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideHttpClient(),
        providePrimeNG({
            license: import.meta.env.CCDAVIEW_PRIMENG_LICENSE,
            theme: {
                preset: NoirLara,
                options: {
                    darkModeSelector: false
                }
            }
        })
    ]
};
