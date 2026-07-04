import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/shared/firebase/admin";
import { GeminiUnavailableError, generateText } from "@/shared/gemini/generate";
import { reserveIntroCall } from "@/shared/gemini/usage";
import { verifyBearerUid } from "@/shared/lib/verify-id-token";

const bodySchema = z.object({ cardId: z.string().min(1) });

interface CardDoc {
  nickname: string;
  company: string | null;
  role: string | null;
  service: string | null;
  aiIntro: string | null;
  ownerUid: string;
}

/**
 * AI badge one-liner (task #7). Generates a one-line builder intro via
 * Gemini and caches it onto the card (Admin SDK — client writes to aiIntro
 * are rules-denied). Enforces per-uid + global caps and skips regeneration
 * when the card's source fields are unchanged (cache). Degrades to 503 when
 * no API key is configured; the card itself stays fully usable.
 */
export async function POST(request: Request) {
  const uid = await verifyBearerUid(request);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const cardRef = adminDb.collection("cards").doc(parsed.data.cardId);
  const cardSnap = await cardRef.get();
  if (!cardSnap.exists) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  const card = cardSnap.data() as CardDoc;
  if (card.ownerUid !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sourceHash = createHash("sha256")
    .update(
      JSON.stringify([card.nickname, card.company, card.role, card.service]),
    )
    .digest("hex");

  const reservation = await reserveIntroCall(uid, sourceHash);
  if (reservation.status === "cached" && card.aiIntro) {
    return NextResponse.json({ aiIntro: card.aiIntro, cached: true });
  }
  if (reservation.status === "uid_cap") {
    return NextResponse.json(
      { error: "AI 소개 생성 횟수를 모두 사용했어요." },
      { status: 429 },
    );
  }
  if (reservation.status === "global_cap") {
    return NextResponse.json(
      { error: "행사 전체 AI 사용량 한도에 도달했어요." },
      { status: 429 },
    );
  }

  const prompt = buildPrompt(card);
  try {
    const aiIntro = await generateText(prompt);
    await cardRef.update({ aiIntro });
    return NextResponse.json({ aiIntro });
  } catch (error) {
    if (error instanceof GeminiUnavailableError) {
      return NextResponse.json(
        { error: "AI 소개 기능이 아직 준비되지 않았어요." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "AI 소개 생성에 실패했어요. 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}

function buildPrompt(card: CardDoc): string {
  const facts = [
    `닉네임: ${card.nickname}`,
    card.company && `회사/소속: ${card.company}`,
    card.role && `역할: ${card.role}`,
    card.service && `만들고 있는 것: ${card.service}`,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "너는 개발자 행사(Google I/O Extended)의 명함 소개 문구를 쓰는 카피라이터야.",
    "아래 정보를 바탕으로 이 사람을 한 문장(한국어, 40자 이내)으로 매력적으로 소개해줘.",
    "이모지나 따옴표 없이 문장만 출력해.",
    "",
    facts,
  ].join("\n");
}
