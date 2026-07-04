import type { Timestamp } from "firebase/firestore";

/**
 * scanEdges/{scannerUid}_{targetUid} — one unidirectional Passport scan.
 * Progress is computed as `scanner == me OR target == me` (a connection
 * counts regardless of who scanned whom), so a single scan links both.
 */
export interface ScanEdgeData {
  scanner: string;
  target: string;
  at: Timestamp;
}

export type ScanEdge = ScanEdgeData & { id: string };
