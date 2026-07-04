import { resolve } from "node:path";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

// FSD layer dependency direction (one-way): shared -> entities -> features -> widgets -> views -> app
const FSD_LAYERS = ["shared", "entities", "features", "widgets", "views", "app"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/root-path": resolve(import.meta.dirname),
      "boundaries/elements": FSD_LAYERS.map((type) => ({
        type,
        pattern: `src/${type}/**`,
        mode: "full",
      })),
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: FSD_LAYERS.map((type, index) => ({
            from: { type },
            allow: { to: { type: FSD_LAYERS.slice(0, index + 1) } },
          })),
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
