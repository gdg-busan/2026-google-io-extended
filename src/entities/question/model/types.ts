import type { Timestamp } from "firebase/firestore";

/**
 * questions/{qid} — Q&A entry. Public read when hidden==false.
 * No likeCount field — like counts are always computed client-side from
 * the likes collection (plan: "likeCount 저장 안 함", 변조 불가).
 */
export interface QuestionData {
  uid: string;
  text: string;
  /** Moderation flag. System-only write (admin console, task #6). */
  hidden: boolean;
  /** System-only write (admin console, task #6). */
  answered: boolean;
  createdAt: Timestamp;
}

export type Question = QuestionData & { id: string };
