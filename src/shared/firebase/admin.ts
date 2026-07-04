import "server-only";

import {
  type App,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Admin SDK — server-only (Route Handlers). Never import from a Client
 * Component or any code that ships to the browser bundle.
 *
 * Local dev default: talks to the Firestore/Auth emulators via the standard
 * FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST env vars (set by
 * `firebase emulators:start` or .env.local), so no service account is
 * required until a real Firebase project exists.
 */
function createAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

  if (useEmulators || !serviceAccountJson) {
    // Emulator mode (or no credentials yet): project ID only is sufficient.
    return initializeApp({ projectId });
  }

  const serviceAccount = JSON.parse(serviceAccountJson) as Record<
    string,
    string
  >;
  return initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });
}

const adminApp = createAdminApp();

export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
