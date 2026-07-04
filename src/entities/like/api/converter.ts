import type { FirestoreDataConverter } from "firebase/firestore";
import type { LikeData } from "../model/types";

export const likeConverter: FirestoreDataConverter<LikeData> = {
  toFirestore(like) {
    return like;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      qid: data.qid,
      uid: data.uid,
      createdAt: data.createdAt,
    };
  },
};
