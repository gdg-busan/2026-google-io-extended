"use client";

import { atom } from "jotai";
import { likesAtom } from "@/entities/like";
import { uidAtom } from "@/entities/session";

/** Question ids the current uid has already liked (create-only — can't unlike). */
export const myLikedQuestionIdsAtom = atom((get) => {
  const uid = get(uidAtom);
  if (!uid) return new Set<string>();
  const likes = get(likesAtom);
  return new Set(likes.filter((like) => like.uid === uid).map((like) => like.qid));
});
