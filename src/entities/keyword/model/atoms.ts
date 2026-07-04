"use client";

import { collection, query, where } from "firebase/firestore";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { keywordConverter } from "../api/converter";

export const keywordsCollection = collection(db, "keywords").withConverter(keywordConverter);

/**
 * Rules allow unconditional public read on `keywords` (no `hidden` field is
 * modeled server-side, so `where("hidden", "==", false)` would wrongly
 * exclude every doc — they're created without the field at all). Moderation
 * (admin console, task #6) sets `hidden: true` via Admin SDK, so visibility
 * is filtered client-side here instead — same intent as the hidden==false
 * rule used for cards/questions, just applied after the fetch.
 */
const rawWordcloudKeywordsAtom = atomWithObservable(
  () => collectionObservable(query(keywordsCollection, where("type", "==", "wordcloud"))),
  { initialValue: [] },
);

const rawNetworkingKeywordsAtom = atomWithObservable(
  () => collectionObservable(query(keywordsCollection, where("type", "==", "networking"))),
  { initialValue: [] },
);

/** Public word cloud keyword feed, hidden entries filtered out. */
export const wordcloudKeywordsAtom = atom((get) =>
  get(rawWordcloudKeywordsAtom).filter((keyword) => keyword.hidden !== true),
);

/** Public networking keyword feed, hidden entries filtered out. */
export const networkingKeywordsAtom = atom((get) =>
  get(rawNetworkingKeywordsAtom).filter((keyword) => keyword.hidden !== true),
);
