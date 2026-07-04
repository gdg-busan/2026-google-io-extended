"use client";

import { getIdToken } from "firebase/auth";
import { auth } from "@/shared/firebase";

/**
 * recoveryToken format is `${cardId}.${code}` — the whole thing is what
 * users are told to save/paste, so they never need to remember a bare
 * Firestore doc ID separately from the code.
 */
export function parseRecoveryToken(
  recoveryToken: string,
): { cardId: string; code: string } | null {
  const [cardId, code] = recoveryToken.trim().split(".");
  if (!cardId || !code) {
    return null;
  }
  return { cardId, code };
}

export async function recoverCard(
  cardId: string,
  code: string,
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not signed in");
  }
  const idToken = await getIdToken(currentUser);

  const response = await fetch("/api/card/recover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ cardId, code }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "복구에 실패했습니다");
  }
}
