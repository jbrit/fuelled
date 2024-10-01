import { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from 'dotenv';

dotenv.config({
  path: ['.env.local', '.env'],
});

const config: CodegenConfig = {
  schema: process.env.VITE_INDEXER_GRAPHQL_URL,
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
