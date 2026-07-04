import { collection, orderBy, query, where } from "firebase/firestore";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { uidAtom } from "@/entities/session";
import { cardConverter } from "../api/converter";
import type { Card } from "./types";

const cardsCollection = collection(db, "cards").withConverter(cardConverter);

/** 현재 uid가 소유한 카드(첫 항목) 또는 null. uid가 없으면 항상 null. */
export const myCardAtom = atomWithObservable<Card | null>(
  (get) => {
    const uid = get(uidAtom);
    if (!uid) {
      // uid 없음 → Firestore 접근 없이 즉시 null 방출.
      return {
        subscribe(observer: { next: (v: Card | null) => void }) {
          observer.next(null);
          return { unsubscribe() {} };
        },
      };
    }
    const source = collectionObservable(
      query(
        cardsCollection,
        where("ownerUid", "==", uid),
        orderBy("createdAt", "desc"),
      ),
    );
    return {
      subscribe(observer: {
        next: (v: Card | null) => void;
        error?: (e: unknown) => void;
      }) {
        const sub = source.subscribe({
          next: (cards) => observer.next(cards[0] ?? null),
          error: observer.error,
        });
        return { unsubscribe: () => sub.unsubscribe() };
      },
    };
  },
  { initialValue: null },
);

export const hasRegisteredCardAtom = atom((get) => get(myCardAtom) !== null);
