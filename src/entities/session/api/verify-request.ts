import "server-only";
import { adminAuth } from "@/shared/firebase/admin";

export class UnauthorizedError extends Error {}

/**
 * Verifies the Firebase ID token a client sends as `Authorization: Bearer
 * <idToken>` and returns its uid. Route Handlers that need to know "which
 * anonymous browser profile is calling" (card recovery, etc.) use this
 * instead of trusting a client-supplied uid.
 */
export async function verifyIdTokenFromRequest(
  request: Request,
): Promise<string> {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Missing bearer token");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
