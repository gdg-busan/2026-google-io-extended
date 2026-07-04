import type { Timestamp } from "firebase/firestore";

export type KeywordType = "wordcloud" | "networking";

/**
 * keywords/{uid}_{n} — word cloud / networking keyword slot. `n` is capped
 * to [0, MAX_KEYWORD_SLOTS - 1] by the Firestore ID convention and is
 * shared across both types (one slot pool per uid, not per type).
 */
export interface KeywordData {
  uid: string;
  text: string;
  type: KeywordType;
  createdAt: Timestamp;
}

export type Keyword = KeywordData & { id: string };

/** Per-uid slot cap enforced by the `keywords/{uid}_{n}` ID convention. */
export const MAX_KEYWORD_SLOTS = 10;
