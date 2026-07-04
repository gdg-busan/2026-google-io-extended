"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/shared/firebase";

/**
 * Enters the networking raffle: raffleEntries/{uid}. Contact info is
 * collected ONLY at this point (plan: "응모 시점에 연락처 입력"), never
 * before. Create-only per the rules — one entry per builder.
 */
export async function enterRaffle(uid: string, contact: string): Promise<void> {
  const trimmed = contact.trim();
  if (!trimmed) {
    throw new Error("연락처를 입력해 주세요.");
  }
  await setDoc(doc(db, "raffleEntries", uid), {
    contact: trimmed,
    at: serverTimestamp(),
  });
}
