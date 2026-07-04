"use client";

import { query, where } from "firebase/firestore";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { collectionObservable } from "@/shared/lib";
import { keywordsCollection, MAX_KEYWORD_SLOTS, type Keyword } from "@/entities/keyword";
import { uidAtom } from "@/entities/session";

/** My own keyword docs, across both types (they share one `{uid}_{n}` slot pool). */
export const myKeywordsAtom = atomWithObservable<Keyword[]>(
  (get) => {
    const uid = get(uidAtom);
    return collectionObservable(
      query(keywordsCollection, where("uid", "==", uid ?? "__no_uid__")),
    );
  },
  { initialValue: [] },
);

/** Slot indices (the `n` in `{uid}_{n}`) already used by the current uid. */
export const usedKeywordSlotIndicesAtom = atom((get) => {
  const uid = get(uidAtom);
  if (!uid) return [];
  const keywords = get(myKeywordsAtom);
  return keywords
    .map((keyword) => Number(keyword.id.slice(uid.length + 1)))
    .filter((slotIndex) => Number.isInteger(slotIndex));
});

/** True once all MAX_KEYWORD_SLOTS id slots are used — submission UI should disable. */
export const isKeywordCapReachedAtom = atom(
  (get) => get(usedKeywordSlotIndicesAtom).length >= MAX_KEYWORD_SLOTS,
);
