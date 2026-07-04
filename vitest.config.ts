import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Unlike `next dev`/`next build`, plain vitest never loads `.env.local`.
 * Several entity barrels (e.g. `@/entities/session`) import
 * `@/shared/firebase` at module scope, and `getAuth()` there throws
 * synchronously when `NEXT_PUBLIC_FIREBASE_API_KEY` is undefined. Load
 * `.env.local` into `process.env` so those modules initialize the same way
 * they do under Next.js, instead of crashing on import in every test file
 * that transitively touches Firebase.
 */
function loadDotEnvLocal(): void {
  const path = fileURLToPath(new URL("./.env.local", import.meta.url));
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const match = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/.exec(line);
    if (!match) continue;
    const [, key, value = ""] = match;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
loadDotEnvLocal();

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
