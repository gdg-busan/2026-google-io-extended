import type { Timestamp } from "firebase/firestore";

/**
 * sessions/{uid} — accession KPI evidence (plan: "접속 KPI의 근거").
 * uid is intentionally NOT a document field — it's the doc ID, and the
 * security rule (task #2) only allows the exact key set below on create.
 */
export interface Session {
  firstSeenAt: Timestamp;
  lastSeenAt: Timestamp;
}
