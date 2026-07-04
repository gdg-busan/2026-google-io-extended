"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/shared/firebase";

/**
 * Create-only like (likes/{qid}_{uid}). Firestore rules deny both update
 * and delete on this collection, so liking a question is one-directional —
 * there is no "unlike".
 */
export async function likeQuestion(qid: string, uid: string): Promise<void> {
  const ref = doc(db, "likes", `${qid}_${uid}`);
  await setDoc(ref, { qid, uid, createdAt: serverTimestamp() });
}
