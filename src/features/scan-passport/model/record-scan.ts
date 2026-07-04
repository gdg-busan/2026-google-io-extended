"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/shared/firebase";

/**
 * Records a unidirectional Passport scan: scanEdges/{scannerUid}_{targetUid}.
 * The security rules require scanner == auth.uid, the id's target segment to
 * match, and scanner != target. Idempotent — re-scanning the same person
 * just overwrites the same doc id.
 */
export async function recordScan(
  scannerUid: string,
  targetUid: string,
): Promise<void> {
  const target = targetUid.trim();
  if (!target) {
    throw new Error("스캔한 코드가 비어 있어요.");
  }
  if (target === scannerUid) {
    throw new Error("자기 자신은 스캔할 수 없어요.");
  }
  await setDoc(doc(db, "scanEdges", `${scannerUid}_${target}`), {
    scanner: scannerUid,
    target,
    at: serverTimestamp(),
  });
}
