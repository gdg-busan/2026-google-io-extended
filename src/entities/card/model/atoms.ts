import {
  collection,
  doc,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { atomWithObservable } from "jotai/utils";
import { atomFamily } from "jotai/utils";
import { db } from "@/shared/firebase";
import { collectionObservable, docObservable } from "@/shared/lib";
import { cardConverter } from "../api/converter";

const cardsCollection = collection(db, "cards").withConverter(cardConverter);

/** Public card list, newest first. Mirrors the `hidden == false` read rule. */
export const cardsListAtom = atomWithObservable(
  () =>
    collectionObservable(
      query(
        cardsCollection,
        where("hidden", "==", false),
        orderBy("createdAt", "desc"),
      ),
    ),
  { initialValue: [] },
);

/** Single card by id, for the card detail page. */
export const cardByIdAtomFamily = atomFamily((cardId: string) =>
  atomWithObservable(
    () => docObservable(doc(cardsCollection, cardId)),
    { initialValue: null },
  ),
);
