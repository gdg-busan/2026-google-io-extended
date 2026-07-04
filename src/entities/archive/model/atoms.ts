"use client";

import { collection, orderBy, query } from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { archiveConverter } from "../api/converter";

const archiveCollection = collection(db, "archive").withConverter(archiveConverter);

/** All archive items, newest first. Public read (post-event materials). */
export const archiveItemsAtom = atomWithObservable(
  () => collectionObservable(query(archiveCollection, orderBy("createdAt", "desc"))),
  { initialValue: [] },
);
