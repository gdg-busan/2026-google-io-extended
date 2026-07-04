import type { Timestamp } from "firebase/firestore";

export type TalkStatus = "pending" | "approved";

/** talks/{tid} — lightning talk application. */
export interface TalkData {
  uid: string;
  title: string;
  link: string | null;
  /** System-only write (admin console, task #6). */
  status: TalkStatus;
  /** System-only write (admin console, task #6). */
  order: number | null;
  createdAt: Timestamp;
}

export type Talk = TalkData & { id: string };
