import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/shared/firebase/admin";
import { verifyAdminSessionOrRespond } from "@/shared/lib/admin-auth";

const patchSchema = z.object({ hidden: z.boolean() });

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Keyword moderation (task #6): hidden toggle. Admin SDK writes bypass
 * Firestore rules entirely, so this works even though the keywords rule
 * doesn't model a `hidden` field for client writes.
 *
 * NOTE (flagged to team-lead): entities/keyword's public read atoms
 * (wordcloudKeywordsAtom / networkingKeywordsAtom) don't currently filter
 * on `hidden`, so a hidden keyword still renders on the board/screen until
 * that slice adds `where("hidden", "==", false)` — same pattern already
 * used by cards/questions. Out of scope here (entities/keyword is owned
 * by another worker's slice).
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
  await adminDb
    .collection("keywords")
    .doc(id)
    .update({ hidden: parsed.data.hidden });
  return NextResponse.json({ ok: true });
}
