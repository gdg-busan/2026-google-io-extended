import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CardNotFoundError,
  ForbiddenError,
  issueRecoveryCode,
} from "@/entities/card/api/recovery";
import {
  UnauthorizedError,
  verifyIdTokenFromRequest,
} from "@/entities/session/api/verify-request";

const bodySchema = z.object({
  cardId: z.string().min(1),
});

export async function POST(request: Request) {
  let uid: string;
  try {
    uid = await verifyIdTokenFromRequest(request);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const recoveryCode = await issueRecoveryCode(parsed.data.cardId, uid);
    return NextResponse.json({ recoveryCode });
  } catch (error) {
    if (error instanceof CardNotFoundError) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Not the card owner" }, {
        status: 403,
      });
    }
    throw error;
  }
}
