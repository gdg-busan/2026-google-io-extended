"use client";

import { collection, limit, query, where, type Query } from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { uidAtom } from "@/entities/session";

interface OwnedCard {
  id: string;
  ownerUid: string;
}

/**
 * The current user's own card id (or null if they haven't registered one).
 * Match/AI-intro need this to target the caller's card. Queried by
 * ownerUid; a builder has at most one card in practice.
 */
export const myCardIdAtom = atomWithObservable<string | null>(
  (get) => {
    const uid = get(uidAtom);
    const source = collectionObservable<OwnedCard>(
      query(
        collection(db, "cards"),
        where("ownerUid", "==", uid ?? "__no_uid__"),
        limit(1),
      ) as Query<OwnedCard>,
    );
    return {
      subscribe(observer: { next: (value: string | null) => void; error?: (err: unknown) => void }) {
        return source.subscribe({
          next: (cards) => observer.next(cards[0]?.id ?? null),
          error: observer.error,
        });
      },
    };
  },
  { initialValue: null },
);
