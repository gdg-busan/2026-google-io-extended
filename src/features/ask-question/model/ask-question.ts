"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/shared/firebase";

export const MAX_QUESTION_LENGTH = 300;

/** Creates a new question (questions/{qid}). hidden/answered start false — system-only after creation. */
export async function askQuestion(uid: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("질문 내용을 입력해 주세요.");
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    throw new Error(`질문은 ${MAX_QUESTION_LENGTH}자 이내로 작성해 주세요.`);
  }

  await addDoc(collection(db, "questions"), {
    uid,
    text: trimmed,
    hidden: false,
    answered: false,
    createdAt: serverTimestamp(),
  });
}
