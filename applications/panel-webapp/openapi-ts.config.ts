import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    input: "http://localhost:4345/openapi.json",
    output: "src/services/openapi",
    plugins: [
        {
            name: "@hey-api/client-axios",
            runtimeConfigPath: "../../config/hey-api.ts",
        },
        "zod",
        "@hey-api/schemas",
        {
            dates: true,
            name: "@hey-api/transformers",
        },
        {
            enums: "javascript",
            name: "@hey-api/typescript",
        },
        {
            name: "@hey-api/sdk",
            transformer: true,
        },
    ],
});
