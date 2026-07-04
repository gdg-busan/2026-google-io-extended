import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/shared/firebase/admin";
import { verifyAdminSessionOrRespond } from "@/shared/lib/admin-auth";

const postSchema = z.object({
  type: z.enum(["slide", "photo", "discord"]),
  title: z.string().min(1).max(120),
  url: z.string().url(),
});

/**
 * Archive upload (task #8). Admin-only URL-record entry (slides / photos /
 * Discord links) — no file storage in v1, just a link with a title. Admin
 * SDK write; the security rules deny all client writes to `archive`.
 */
export async function POST(request: Request) {
  const unauthorized = await verifyAdminSessionOrRespond();
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const docRef = await adminDb.collection("archive").add({
    type: parsed.data.type,
    title: parsed.data.title,
    url: parsed.data.url,
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: docRef.id });
}
