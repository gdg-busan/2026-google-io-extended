"use client";

import { collection, orderBy, query, where } from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { talkConverter } from "../api/converter";

export const talksCollection = collection(db, "talks").withConverter(talkConverter);

/** Public list of approved lightning talks, in admin-assigned order. */
export const approvedTalksAtom = atomWithObservable(
  () =>
    collectionObservable(
      query(talksCollection, where("status", "==", "approved"), orderBy("order", "asc")),
    ),
  { initialValue: [] },
);
