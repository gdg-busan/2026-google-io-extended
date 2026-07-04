import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/shared/firebase/admin";
import {
  GEMINI_GLOBAL_CALL_CAP,
  GEMINI_INTRO_PER_UID_CAP,
  GEMINI_MATCH_PER_UID_CAP,
} from "@/shared/config/event";

const GLOBAL_DOC_ID = "__global__";

export type ReservationResult =
  | { status: "ok" }
  | { status: "cached" }
  | { status: "uid_cap" }
  | { status: "global_cap" };

interface UsageDoc {
  introCount?: number;
  matchCount?: number;
  lastIntroHash?: string;
}

/**
 * Reserves one Gemini "intro" call for `uid` inside a transaction, enforcing
 * both the per-uid cap and the event-wide global cap (plan cost ceiling).
 * If `sourceHash` matches the last successful generation, returns `cached`
 * WITHOUT consuming quota (re-saving an unchanged card is free).
 * Counters live in `geminiUsage/*` — not in the security rules, so the
 * default-deny rule blocks all client access; only Admin SDK touches them.
 */
export async function reserveIntroCall(
  uid: string,
  sourceHash: string,
): Promise<ReservationResult> {
  return reserve(uid, "intro", GEMINI_INTRO_PER_UID_CAP, sourceHash);
}

/** Reserves one Gemini "match" call for `uid` (per-uid + global cap). */
export async function reserveMatchCall(uid: string): Promise<ReservationResult> {
  return reserve(uid, "match", GEMINI_MATCH_PER_UID_CAP);
}

async function reserve(
  uid: string,
  kind: "intro" | "match",
  perUidCap: number,
  sourceHash?: string,
): Promise<ReservationResult> {
  const userRef = adminDb.collection("geminiUsage").doc(uid);
  const globalRef = adminDb.collection("geminiUsage").doc(GLOBAL_DOC_ID);
  const countField = kind === "intro" ? "introCount" : "matchCount";

  return adminDb.runTransaction(async (tx) => {
    const [userSnap, globalSnap] = await Promise.all([
      tx.get(userRef),
      tx.get(globalRef),
    ]);
    const user = (userSnap.data() as UsageDoc | undefined) ?? {};
    const globalCount = (globalSnap.data()?.totalCount as number | undefined) ?? 0;

    if (kind === "intro" && sourceHash && user.lastIntroHash === sourceHash) {
      return { status: "cached" };
    }

    const used = (user[countField] as number | undefined) ?? 0;
    if (used >= perUidCap) {
      return { status: "uid_cap" };
    }
    if (globalCount >= GEMINI_GLOBAL_CALL_CAP) {
      return { status: "global_cap" };
    }

    const userUpdate: Record<string, unknown> = {
      [countField]: FieldValue.increment(1),
    };
    if (kind === "intro" && sourceHash) {
      userUpdate.lastIntroHash = sourceHash;
    }
    tx.set(userRef, userUpdate, { merge: true });
    tx.set(globalRef, { totalCount: FieldValue.increment(1) }, { merge: true });
    return { status: "ok" };
  });
}
