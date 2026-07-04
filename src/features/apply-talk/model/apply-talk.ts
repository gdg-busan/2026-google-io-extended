"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/shared/firebase";

export const MAX_TALK_TITLE_LENGTH = 100;

interface ApplyTalkInput {
  uid: string;
  title: string;
  link?: string;
}

/** Creates a lightning talk application (talks/{tid}), always starting status: "pending". */
export async function applyTalk({ uid, title, link }: ApplyTalkInput): Promise<void> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("발표 제목을 입력해 주세요.");
  }
  if (trimmedTitle.length > MAX_TALK_TITLE_LENGTH) {
    throw new Error(`제목은 ${MAX_TALK_TITLE_LENGTH}자 이내로 작성해 주세요.`);
  }

  const trimmedLink = link?.trim();
  await addDoc(collection(db, "talks"), {
    uid,
    title: trimmedTitle,
    link: trimmedLink || null,
    status: "pending",
    order: null,
    createdAt: serverTimestamp(),
  });
}
