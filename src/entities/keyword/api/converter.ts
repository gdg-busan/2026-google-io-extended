import type { FirestoreDataConverter } from "firebase/firestore";
import type { KeywordData } from "../model/types";

export const keywordConverter: FirestoreDataConverter<KeywordData> = {
  toFirestore(keyword) {
    return keyword;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      uid: data.uid,
      text: data.text,
      type: data.type,
      hidden: data.hidden ?? false,
      createdAt: data.createdAt,
    };
  },
};
