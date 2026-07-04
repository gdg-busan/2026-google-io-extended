import { NextResponse } from "next/server";
import { z } from "zod";
import { CARD_RECOVERY_CODE_LENGTH } from "@/shared/config";
import {
  InvalidCodeError,
  RateLimitedError,
  RecoveryNotFoundError,
  redeemRecoveryCode,
} from "@/entities/card/api/recovery";
import {
  UnauthorizedError,
  verifyIdTokenFromRequest,
} from "@/entities/session/api/verify-request";

const bodySchema = z.object({
  cardId: z.string().min(1),
  code: z.string().length(CARD_RECOVERY_CODE_LENGTH),
});

export async function POST(request: Request) {
  let newUid: string;
  try {
    newUid = await verifyIdTokenFromRequest(request);
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
    await redeemRecoveryCode(parsed.data.cardId, parsed.data.code, newUid);
    return NextResponse.json({ cardId: parsed.data.cardId });
  } catch (error) {
    if (error instanceof RecoveryNotFoundError) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    if (error instanceof RateLimitedError) {
      return NextResponse.json(
        { error: "Too many attempts, try again later" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(error.retryAfterMs / 1000)),
          },
        },
      );
    }
    if (error instanceof InvalidCodeError) {
      return NextResponse.json(
        { error: "Recovery code did not match" },
        { status: 401 },
      );
    }
    throw error;
  }
}
