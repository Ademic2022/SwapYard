import type { CodegenConfig } from "@graphql-codegen/cli";

// The schema is exported from the Django API with:
//   uv run python manage.py export_schema
const config: CodegenConfig = {
  schema: process.env.GRAPHQL_SCHEMA ?? "../SwapYard-server/schema.graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/gql/**/*"],
  ignoreNoDocuments: true,
  generates: {
    "./src/gql/": {
      preset: "client",
      presetConfig: { fragmentMasking: false },
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        scalars: { DateTime: "string", Upload: "File" },
      },
    },
  },
};

export default config;
