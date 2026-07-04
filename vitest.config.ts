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

/**
 * `.env.local` is gitignored, so on a fresh checkout / CI it is absent and the
 * loader above is a no-op — `getAuth()` would then throw `auth/invalid-api-key`
 * at import. Fill any still-missing Firebase keys with the demo values from
 * `.env.local.example` so tests are hermetic and pass without a local env file.
 * Real `.env.local` values (loaded first) still take precedence.
 */
const FIREBASE_TEST_DEFAULTS: Record<string, string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "io2026-builder-board.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "io2026-builder-board",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "io2026-builder-board.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "000000000000",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:000000000000:web:0000000000000000000000",
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
};

function applyFirebaseTestDefaults(): void {
  for (const [key, value] of Object.entries(FIREBASE_TEST_DEFAULTS)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnvLocal();
applyFirebaseTestDefaults();

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
