import type { FirestoreDataConverter } from "firebase/firestore";
import type { QuestionData } from "../model/types";

export const questionConverter: FirestoreDataConverter<QuestionData> = {
  toFirestore(question) {
    return question;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      uid: data.uid,
      text: data.text,
      hidden: data.hidden ?? false,
      answered: data.answered ?? false,
      createdAt: data.createdAt,
    };
  },
};
