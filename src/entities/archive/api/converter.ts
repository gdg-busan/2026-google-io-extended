import type { FirestoreDataConverter } from "firebase/firestore";
import type { ArchiveData, ArchiveType } from "../model/types";

export const archiveConverter: FirestoreDataConverter<ArchiveData> = {
  toFirestore(item) {
    return item;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      type: (data.type as ArchiveType) ?? "slide",
      title: data.title ?? "",
      url: data.url ?? "",
      createdAt: data.createdAt ?? null,
    };
  },
};
