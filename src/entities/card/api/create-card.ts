import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/shared/firebase";
import type { CardInput } from "../model/types";

/**
 * Creates cards/{cardId} directly from the client (security rule requires
 * ownerUid == auth.uid, hidden == false, and — critically — that the
 * 'aiIntro' key is entirely ABSENT on create, not merely null). Uses the
 * plain (non-converter) collection ref so we control the exact key set;
 * the converter is reserved for reads, where a missing aiIntro defaults
 * to null (see api/converter.ts).
 */
export async function createCard(
  ownerUid: string,
  input: CardInput,
): Promise<string> {
  const docRef = await addDoc(collection(db, "cards"), {
    nickname: input.nickname,
    company: input.company ?? null,
    role: input.role ?? null,
    github: input.github ?? null,
    linkedin: input.linkedin ?? null,
    service: input.service ?? null,
    ownerUid,
    hidden: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
