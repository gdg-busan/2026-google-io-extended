"use client";

import { doc, type DocumentReference } from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { docObservable } from "@/shared/lib";
import { uidAtom } from "@/entities/session";
import type { MatchData } from "./types";

/**
 * My Builder Match results (matches/{uid}), populated server-side by
 * /api/gemini/match and read here in realtime. Rules allow owner read only.
 */
export const myMatchesAtom = atomWithObservable<(MatchData & { id: string }) | null>(
  (get) => {
    const uid = get(uidAtom);
    return docObservable(
      doc(db, "matches", uid ?? "__no_uid__") as DocumentReference<MatchData>,
    );
  },
  { initialValue: null },
);
