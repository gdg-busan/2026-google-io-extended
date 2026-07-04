"use client";

import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/shared/firebase";

/**
 * Creates sessions/{uid} on first visit, or touches lastSeenAt on repeat
 * visits. firstSeenAt is set exactly once (transaction guards the race
 * between the read and the write) — it is the source of truth for the
 * "80% attended" KPI.
 */
export async function ensureSession(uid: string): Promise<void> {
  const ref = doc(db, "sessions", uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) {
      transaction.update(ref, { lastSeenAt: serverTimestamp() });
      return;
    }
    // NOTE: keys here must exactly match the rule's hasOnly(['firstSeenAt',
    // 'lastSeenAt']) — do not add fields (e.g. uid) without updating the rule.
    transaction.set(ref, {
      firstSeenAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    });
  });
}
