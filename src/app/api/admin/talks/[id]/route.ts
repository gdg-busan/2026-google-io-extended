import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/shared/firebase/admin";
import { verifyAdminSessionOrRespond } from "@/shared/lib/admin-auth";

const patchSchema = z
  .object({
    status: z.literal("approved").optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine((data) => data.status !== undefined || data.order !== undefined, {
    message: "No fields to update",
  });

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Lightning talk moderation (task #6): approve (+ optionally set order) or
 * change order for an already-approved talk. Admin SDK write — the
 * security rules deny client updates to talks entirely (status/order are
 * system-only fields).
 */
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
  const update: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) {
    update.status = parsed.data.status;
  }
  if (parsed.data.order !== undefined) {
    update.order = parsed.data.order;
  }

  await adminDb.collection("talks").doc(id).update(update);
  return NextResponse.json({ ok: true });
}

/** Rejects (deletes) a pending talk application. Admin SDK — rules deny client delete. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const unauthorized = await verifyAdminSessionOrRespond();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  await adminDb.collection("talks").doc(id).delete();
  return NextResponse.json({ ok: true });
}
