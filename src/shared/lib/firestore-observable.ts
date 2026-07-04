"use client";

import type {
  DocumentReference,
  FirestoreError,
  Query,
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

/**
 * Minimal Observable-like object (just `subscribe`) — the shape jotai's
 * `atomWithObservable` needs. Avoids pulling in rxjs for a single use case:
 * bridging Firestore's realtime `onSnapshot` streams into atoms (plan:
 * "서버 상태는 Firestore 구독이 원본" — atomWithObservable, no store duplication).
 */
interface MinimalObservable<T> {
  subscribe(observer: {
    next: (value: T) => void;
    error?: (err: unknown) => void;
  }): { unsubscribe: () => void };
}

/** Bridges a single Firestore document's onSnapshot stream into an atomWithObservable source. */
export function docObservable<T extends object>(
  ref: DocumentReference<T>,
): MinimalObservable<(T & { id: string }) | null> {
  return {
    subscribe(observer) {
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) =>
          observer.next(
            snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null,
          ),
        (error: FirestoreError) => observer.error?.(error),
      );
      return { unsubscribe };
    },
  };
}

/** Bridges a Firestore query's onSnapshot stream into an atomWithObservable source. */
export function collectionObservable<T extends object>(
  query: Query<T>,
): MinimalObservable<(T & { id: string })[]> {
  return {
    subscribe(observer) {
      const unsubscribe = onSnapshot(
        query,
        (snapshot) =>
          observer.next(
            snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
          ),
        (error: FirestoreError) => observer.error?.(error),
      );
      return { unsubscribe };
    },
  };
}
