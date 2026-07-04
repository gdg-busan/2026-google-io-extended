"use client";

import { query, where } from "firebase/firestore";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { collectionObservable } from "@/shared/lib";
import { talksCollection, type Talk } from "@/entities/talk";
import { uidAtom } from "@/entities/session";

/**
 * My own lightning talk applications (any status — owner can read pending
 * and approved alike). Falls back to a query that can never match while
 * auth hasn't resolved yet.
 */
export const myTalksAtom = atomWithObservable<Talk[]>(
  (get) => {
    const uid = get(uidAtom);
    return collectionObservable(
      query(talksCollection, where("uid", "==", uid ?? "__no_uid__")),
    );
  },
  { initialValue: [] },
);

/** My single lightning talk application, for the "내 신청 상태" badge. */
export const myTalkAtom = atom((get) => get(myTalksAtom)[0] ?? null);
