"use client";

import { auth } from "@/shared/firebase";

/**
 * fetch() wrapper that attaches the current anonymous user's Firebase ID
 * token as a Bearer header, so Route Handlers can verify the caller's uid
 * server-side (see shared/lib/verify-id-token.ts). Not re-exported from the
 * shared/lib barrel — import directly so server code never pulls in the
 * client SDK. Throws if called before anonymous sign-in completes.
 */
export async function authedFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("아직 준비 중이에요. 잠시 후 다시 시도해 주세요.");
  }
  const token = await user.getIdToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}
