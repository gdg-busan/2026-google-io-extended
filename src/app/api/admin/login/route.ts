import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE_NAME } from "@/shared/config/admin";
import {
  AdminRateLimitedError,
  assertLoginRateLimit,
  createSessionToken,
  getClientIp,
  verifyPasscode,
} from "@/shared/lib/admin-auth";

const bodySchema = z.object({ passcode: z.string().min(1) });

/**
 * Passcode login (task #6). Rate-limited per IP (5/min), constant-time
 * compare, then an HttpOnly/Secure/SameSite=Strict session cookie.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  try {
    assertLoginRateLimit(ip);
  } catch (error) {
    if (error instanceof AdminRateLimitedError) {
      return NextResponse.json(
        { error: "Too many attempts, try again later" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(error.retryAfterMs / 1000)),
          },
        },
      );
    }
    throw error;
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!verifyPasscode(parsed.data.passcode)) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const { token, maxAgeSeconds } = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return NextResponse.json({ ok: true });
}
