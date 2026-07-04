import type { FirestoreDataConverter } from "firebase/firestore";
import type { TalkData } from "../model/types";

export const talkConverter: FirestoreDataConverter<TalkData> = {
  toFirestore(talk) {
    return talk;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      uid: data.uid,
      title: data.title,
      link: data.link ?? null,
      status: data.status ?? "pending",
      order: data.order ?? null,
      createdAt: data.createdAt,
    };
  },
};
