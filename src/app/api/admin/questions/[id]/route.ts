import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/shared/firebase/admin";
import { verifyAdminSessionOrRespond } from "@/shared/lib/admin-auth";

const patchSchema = z.object({ hidden: z.boolean() });

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Question moderation (task #6): hidden toggle. Admin SDK — rules deny client writes to this field. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const unauthorized = await verifyAdminSessionOrRespond();
  if (unauthorized) {
    return unauthorized;
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { id } = await params;
  await adminDb
    .collection("questions")
    .doc(id)
    .update({ hidden: parsed.data.hidden });
  return NextResponse.json({ ok: true });
}
