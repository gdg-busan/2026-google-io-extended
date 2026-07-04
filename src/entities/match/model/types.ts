/** One Builder Match recommendation (Gemini-generated, cached in matches/{uid}). */
export interface MatchResult {
  cardId: string;
  nickname: string;
  matchRate: number;
  reason: string;
}

/** matches/{uid} — Gemini-generated match cache. Owner-read, server-write. */
export interface MatchData {
  results: MatchResult[];
  updatedAt: number;
}
