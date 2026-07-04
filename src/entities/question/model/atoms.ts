"use client";

import { collection, orderBy, query, where } from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { questionConverter } from "../api/converter";

const questionsCollection = collection(db, "questions").withConverter(
  questionConverter,
);

/**
 * Public Q&A feed (hidden==false), oldest first. Display order (sorted by
 * client-computed like count) is derived in the view layer — see
 * entities/like's likeCountsAtom.
 */
export const questionsAtom = atomWithObservable(
  () =>
    collectionObservable(
      query(
        questionsCollection,
        where("hidden", "==", false),
        orderBy("createdAt", "asc"),
      ),
    ),
  { initialValue: [] },
);
