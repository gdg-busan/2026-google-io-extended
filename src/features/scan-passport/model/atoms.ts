"use client";

import { doc, type DocumentReference } from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { docObservable } from "@/shared/lib";
import { uidAtom } from "@/entities/session";

interface RaffleEntryData {
  contact: string;
}

/** My raffle entry doc (raffleEntries/{uid}), or null if not entered yet. */
export const myRaffleEntryAtom = atomWithObservable<
  (RaffleEntryData & { id: string }) | null
>(
  (get) => {
    const uid = get(uidAtom);
    return docObservable(
      doc(db, "raffleEntries", uid ?? "__no_uid__") as DocumentReference<RaffleEntryData>,
    );
  },
  { initialValue: null },
);
