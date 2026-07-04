import { NextResponse } from "next/server";
import { adminDb } from "@/shared/firebase/admin";
import { verifyAdminSessionOrRespond } from "@/shared/lib/admin-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Removes an archive item (task #8). Admin SDK — client deletes are rules-denied. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const unauthorized = await verifyAdminSessionOrRespond();
  if (unauthorized) {
    return unauthorized;
  }
  const { id } = await params;
  await adminDb.collection("archive").doc(id).delete();
  return NextResponse.json({ ok: true });
}
