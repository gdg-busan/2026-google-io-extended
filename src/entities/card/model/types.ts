import type { Timestamp } from "firebase/firestore";

/** cards/{cardId} — public-read digital business card (plan: "명함/프로필"). */
export interface CardData {
  nickname: string;
  company: string | null;
  role: string | null;
  github: string | null;
  linkedin: string | null;
  service: string | null;
  /** Gemini-generated one-line intro. System-only write (task #7). */
  aiIntro: string | null;
  ownerUid: string;
  /** Moderation flag. System-only write (admin console, task #6). */
  hidden: boolean;
  createdAt: Timestamp;
}

export type Card = CardData & { id: string };

/** Owner-editable fields — the only ones a client is ever allowed to write. */
export interface CardInput {
  nickname: string;
  company?: string;
  role?: string;
  github?: string;
  linkedin?: string;
  service?: string;
}
