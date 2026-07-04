"use client";

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type AppCheck,
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

/**
 * Client-side Firebase SDK. Client components only — never import from a
 * Server Component (RSC boundary rule, see plan Architecture section).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

function createFirebaseApp(): FirebaseApp {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }
  return initializeApp(firebaseConfig);
}

export const firebaseApp = createFirebaseApp();

export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);

// App Check is opt-in via env (requires a real reCAPTCHA v3 site key in
// production) and is skipped entirely against the local emulator suite.
let appCheck: AppCheck | undefined;
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
if (typeof window !== "undefined" && !useEmulators && recaptchaSiteKey) {
  appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
export { appCheck };

let emulatorsConnected = false;
if (typeof window !== "undefined" && useEmulators && !emulatorsConnected) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  emulatorsConnected = true;
}
