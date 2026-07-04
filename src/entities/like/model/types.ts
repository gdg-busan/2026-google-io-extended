import type { Timestamp } from "firebase/firestore";

/**
 * likes/{qid}_{uid} — create-only dedup doc (Firestore rules deny both
 * update and delete on this collection, so liking a question is
 * one-directional; there is no "unlike").
 */
export interface LikeData {
  qid: string;
  uid: string;
  createdAt: Timestamp;
}

export type Like = LikeData & { id: string };
