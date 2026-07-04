import { adminDb } from "@/shared/firebase/admin";
import { AdminTalksView, type AdminTalkRow } from "@/views/admin";

export default async function AdminTalksPage() {
  const snapshot = await adminDb.collection("talks").get();
  const talks: AdminTalkRow[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: String(data.title ?? ""),
      link: typeof data.link === "string" ? data.link : null,
      status: data.status === "approved" ? "approved" : "pending",
      order: typeof data.order === "number" ? data.order : null,
    };
  });

  return <AdminTalksView talks={talks} />;
}
