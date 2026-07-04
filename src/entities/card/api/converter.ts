import type { FirestoreDataConverter } from "firebase/firestore";
import type { CardData } from "../model/types";

export const cardConverter: FirestoreDataConverter<CardData> = {
  toFirestore(card) {
    return card;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      nickname: data.nickname,
      company: data.company ?? null,
      role: data.role ?? null,
      github: data.github ?? null,
      linkedin: data.linkedin ?? null,
      service: data.service ?? null,
      aiIntro: data.aiIntro ?? null,
      ownerUid: data.ownerUid,
      hidden: data.hidden ?? false,
      createdAt: data.createdAt,
    };
  },
};
