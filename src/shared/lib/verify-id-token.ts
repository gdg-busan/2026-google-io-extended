import "server-only";

import { adminAuth } from "@/shared/firebase/admin";

/**
 * Extracts and verifies the Firebase (anonymous) ID token from an
 * `Authorization: Bearer <token>` header. Returns the caller's uid, or null
 * when the header is missing/invalid. Used by the Gemini Route Handlers to
 * bind per-uid caps to a real verified identity rather than a client claim.
 */
export async function verifyBearerUid(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
