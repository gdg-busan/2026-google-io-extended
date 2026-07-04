"use client";

import { collection } from "firebase/firestore";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { likeConverter } from "../api/converter";

const likesCollection = collection(db, "likes").withConverter(likeConverter);

/**
 * Full likes collection, subscribed once (50-person scale — plan: "50명
 * 규모 OK"). Per-question like counts are derived client-side; likeCount
 * is never stored server-side (plan: "변조 불가").
 */
export const likesAtom = atomWithObservable(() => collectionObservable(likesCollection), {
  initialValue: [],
});

/** Derived: question id -> like count. */
export const likeCountsAtom = atom((get) => {
  const likes = get(likesAtom);
  const counts: Record<string, number> = {};
  for (const like of likes) {
    counts[like.qid] = (counts[like.qid] ?? 0) + 1;
  }
  return counts;
});
