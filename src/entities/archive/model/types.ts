import type { Timestamp } from "firebase/firestore";

export type ArchiveType = "slide" | "photo" | "discord";

/** archive/{id} — post-event material. Public read, Admin SDK write only. */
export interface ArchiveData {
  type: ArchiveType;
  title: string;
  url: string;
  createdAt: Timestamp | null;
}

export type ArchiveItem = ArchiveData & { id: string };
