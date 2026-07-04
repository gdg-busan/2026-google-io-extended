"use client";

import { collection, query, where } from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { keywordConverter } from "../api/converter";

export const keywordsCollection = collection(db, "keywords").withConverter(keywordConverter);

/** Public word cloud keyword feed (no hidden field — unconditional public read). */
export const wordcloudKeywordsAtom = atomWithObservable(
  () => collectionObservable(query(keywordsCollection, where("type", "==", "wordcloud"))),
  { initialValue: [] },
);

/** Public networking keyword feed. */
export const networkingKeywordsAtom = atomWithObservable(
  () => collectionObservable(query(keywordsCollection, where("type", "==", "networking"))),
  { initialValue: [] },
);
