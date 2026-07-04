import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_LOGIN_MAX_ATTEMPTS_PER_WINDOW,
  ADMIN_LOGIN_WINDOW_MS,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_MS,
} from "@/shared/config/admin";

/**
 * Admin console auth (task #6, plan: "passcode(환경변수) → 상수 시간 비교 +
 * 시도 제한 → HttpOnly·Secure·SameSite 세션 쿠키"). Server-only — imported
 * directly by Route Handlers and the /admin protected layout, never
 * through a barrel a Client Component might pull in (same pattern as
 * shared/firebase/admin.ts).
 */

export class AdminRateLimitedError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super("Too many login attempts");
  }
}
export class InvalidAdminSessionError extends Error {}

function getSessionSecret(): Buffer {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) {
    throw new Error("ADMIN_PASSCODE is not configured");
  }
  return createHash("sha256").update(passcode).digest();
}

/**
 * Constant-time passcode compare. Hashes both sides to a fixed-length
 * digest first (same approach as entities/card/api/recovery-code.ts) so
 * timingSafeEqual never sees mismatched buffer lengths.
 */
export function verifyPasscode(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) {
    return false;
  }
  const candidateHash = createHash("sha256").update(candidate).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(candidateHash, expectedHash);
}

/** Signs a `"<expiresAtMs>.<hmacHex>"` session token. */
export function createSessionToken(): {
  token: string;
  maxAgeSeconds: number;
} {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_MS;
  const signature = createHmac("sha256", getSessionSecret())
    .update(String(expiresAt))
    .digest("hex");
  return {
    token: `${expiresAt}.${signature}`,
    maxAgeSeconds: Math.floor(ADMIN_SESSION_MAX_AGE_MS / 1000),
  };
}

/** Verifies a session token's signature and expiry. Throws on failure. */
function verifySessionToken(token: string | undefined): void {
  if (!token) {
    throw new InvalidAdminSessionError();
  }
  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) {
    throw new InvalidAdminSessionError();
  }

  const expectedSignature = createHmac("sha256", getSessionSecret())
    .update(expiresAtRaw)
    .digest("hex");
  const signatureBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (
    signatureBuf.length !== expectedBuf.length ||
    !timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    throw new InvalidAdminSessionError();
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    throw new InvalidAdminSessionError();
  }
}

/** Reads + verifies the admin session cookie for the current request. */
export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value);
}

/**
 * Convenience wrapper for /api/admin/* Route Handlers: every handler calls
 * this first and returns the 401 response if it isn't null. Each handler
 * still verifies independently (plan requirement) — this just removes
 * repeated try/catch boilerplate across ~7 route files.
 */
export async function verifyAdminSessionOrRespond(): Promise<NextResponse | null> {
  try {
    await requireAdminSession();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// --- Per-IP login attempt throttle -----------------------------------
// In-memory, single-process (50-person one-off event — plan YAGNI
// principle). Resets on server restart; acceptable tradeoff at this scale.
const loginAttempts = new Map<
  string,
  { count: number; windowStartAt: number }
>();

export function assertLoginRateLimit(ip: string): void {
  const now = Date.now();
  const existing = loginAttempts.get(ip);
  if (!existing || now - existing.windowStartAt > ADMIN_LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStartAt: now });
    return;
  }
  if (existing.count >= ADMIN_LOGIN_MAX_ATTEMPTS_PER_WINDOW) {
    const retryAfterMs =
      ADMIN_LOGIN_WINDOW_MS - (now - existing.windowStartAt);
    throw new AdminRateLimitedError(Math.max(retryAfterMs, 0));
  }
  existing.count += 1;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
