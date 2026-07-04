"use client";

import { doc, type DocumentReference } from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { docObservable } from "@/shared/lib";
import { uidAtom } from "@/entities/session";
import type { BingoData } from "./types";

/** My bingo board (bingo/{uid}), realtime. Null until generated on first visit. */
export const myBingoAtom = atomWithObservable<(BingoData & { id: string }) | null>(
  (get) => {
    const uid = get(uidAtom);
    return docObservable(
      doc(db, "bingo", uid ?? "__no_uid__") as DocumentReference<BingoData>,
    );
  },
  { initialValue: null },
);
