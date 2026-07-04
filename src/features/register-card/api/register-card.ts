"use client";

import { getIdToken } from "firebase/auth";
import { auth } from "@/shared/firebase";
import { createCard, type CardInput } from "@/entities/card";

export interface RegisterCardResult {
  cardId: string;
  recoveryCode: string;
}

/**
 * Two-step register: (1) client creates the card doc directly (rule:
 * ownerUid==auth.uid, hidden==false, no aiIntro key), (2) a Route Handler
 * issues + hashes the recovery code into cardRecovery/{cardId} (Admin SDK
 * — clients can never read/write that collection).
 */
export async function registerCard(
  uid: string,
  input: CardInput,
): Promise<RegisterCardResult> {
  const cardId = await createCard(uid, input);

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not signed in");
  }
  const idToken = await getIdToken(currentUser);

  const response = await fetch("/api/card/create-recovery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ cardId }),
  });

  if (!response.ok) {
    // The card exists but has no recovery code yet — surface this clearly
    // rather than silently dropping it; the user can retry from the card
    // detail page (a "regenerate recovery code" affordance is a natural
    // follow-up, out of scope for this task).
    throw new Error("Card created, but issuing the recovery code failed");
  }

  const { recoveryCode } = (await response.json()) as {
    recoveryCode: string;
  };
  return { cardId, recoveryCode };
}
