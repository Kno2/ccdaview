import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        testTimeout: 15000,
        reporters: ["default", ["junit", { outputFile: "./test-results/junit/junit.xml" }]]
    }
});
