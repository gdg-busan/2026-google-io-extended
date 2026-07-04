import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/shared/firebase/admin";
import { AdminModerationView, type ModerationRow } from "@/views/admin";

function toRow(
  doc: QueryDocumentSnapshot,
  labelField: string,
): ModerationRow {
  const data = doc.data();
  return {
    id: doc.id,
    label: String(data[labelField] ?? doc.id),
    hidden: Boolean(data.hidden),
  };
}

export default async function AdminModerationPage() {
  const [cardsSnapshot, questionsSnapshot, keywordsSnapshot] =
    await Promise.all([
      adminDb.collection("cards").get(),
      adminDb.collection("questions").get(),
      adminDb.collection("keywords").get(),
    ]);

  return (
    <AdminModerationView
      cards={cardsSnapshot.docs.map((doc) => toRow(doc, "nickname"))}
      questions={questionsSnapshot.docs.map((doc) => toRow(doc, "text"))}
      keywords={keywordsSnapshot.docs.map((doc) => toRow(doc, "text"))}
    />
  );
}
