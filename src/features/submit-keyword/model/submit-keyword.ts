"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/shared/firebase";
import { MAX_KEYWORD_SLOTS, type KeywordType } from "@/entities/keyword";

export const MAX_KEYWORD_LENGTH = 40;

interface SubmitKeywordInput {
  uid: string;
  text: string;
  type: KeywordType;
  /** Slot indices already used by this uid (from usedKeywordSlotIndicesAtom). */
  usedSlotIndices: number[];
}

/** Submits a keyword into the next free `keywords/{uid}_{n}` slot (n in [0, MAX_KEYWORD_SLOTS - 1]). */
export async function submitKeyword({
  uid,
  text,
  type,
  usedSlotIndices,
}: SubmitKeywordInput): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("키워드를 입력해 주세요.");
  }
  if (trimmed.length > MAX_KEYWORD_LENGTH) {
    throw new Error(`키워드는 ${MAX_KEYWORD_LENGTH}자 이내로 입력해 주세요.`);
  }

  const used = new Set(usedSlotIndices);
  let nextSlot = -1;
  for (let slot = 0; slot < MAX_KEYWORD_SLOTS; slot += 1) {
    if (!used.has(slot)) {
      nextSlot = slot;
      break;
    }
  }
  if (nextSlot === -1) {
    throw new Error(`키워드는 최대 ${MAX_KEYWORD_SLOTS}개까지 제출할 수 있어요.`);
  }

  await setDoc(doc(db, "keywords", `${uid}_${nextSlot}`), {
    uid,
    text: trimmed,
    type,
    createdAt: serverTimestamp(),
  });
}
