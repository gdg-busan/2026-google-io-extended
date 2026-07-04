import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/shared/firebase/admin";
import { GeminiUnavailableError, generateText } from "@/shared/gemini/generate";
import { reserveMatchCall } from "@/shared/gemini/usage";
import { verifyBearerUid } from "@/shared/lib/verify-id-token";

const bodySchema = z.object({ cardId: z.string().min(1) });

interface BuilderProfile {
  cardId: string;
  ownerUid: string;
  nickname: string;
  role: string | null;
  service: string | null;
  keywords: string[];
}

/**
 * Builder Match (task #7). Uses Gemini to recommend similar builders with a
 * match rate, then caches the result in `matches/{uid}` (Admin SDK write;
 * the owner reads it client-side per the security rules). Per-uid + global
 * caps apply; degrades to 503 without an API key.
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

  const profiles = await loadProfiles();
  const me = profiles.find(
    (profile) => profile.cardId === parsed.data.cardId && profile.ownerUid === uid,
  );
  if (!me) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const others = profiles.filter((profile) => profile.ownerUid !== uid);
  if (others.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const reservation = await reserveMatchCall(uid);
  if (reservation.status === "uid_cap" || reservation.status === "global_cap") {
    return NextResponse.json(
      { error: "Builder Match 사용 횟수를 모두 사용했어요." },
      { status: 429 },
    );
  }

  try {
    const raw = await generateText(buildPrompt(me, others));
    const results = parseResults(raw, others);
    await adminDb
      .collection("matches")
      .doc(uid)
      .set({ results, updatedAt: Date.now() });
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof GeminiUnavailableError) {
      return NextResponse.json(
        { error: "Builder Match 기능이 아직 준비되지 않았어요." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "매칭에 실패했어요. 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}

async function loadProfiles(): Promise<BuilderProfile[]> {
  const [cardsSnap, keywordsSnap] = await Promise.all([
    adminDb.collection("cards").where("hidden", "==", false).get(),
    adminDb.collection("keywords").where("type", "==", "networking").get(),
  ]);

  const keywordsByUid = new Map<string, string[]>();
  for (const doc of keywordsSnap.docs) {
    const data = doc.data() as { uid: string; text: string; hidden?: boolean };
    if (data.hidden === true) continue;
    const list = keywordsByUid.get(data.uid) ?? [];
    list.push(data.text);
    keywordsByUid.set(data.uid, list);
  }

  return cardsSnap.docs.map((doc) => {
    const data = doc.data() as {
      nickname: string;
      role: string | null;
      service: string | null;
      ownerUid: string;
    };
    return {
      cardId: doc.id,
      ownerUid: data.ownerUid,
      nickname: data.nickname,
      role: data.role ?? null,
      service: data.service ?? null,
      keywords: keywordsByUid.get(data.ownerUid) ?? [],
    };
  });
}

function describe(profile: BuilderProfile): string {
  const parts = [
    profile.role && `역할 ${profile.role}`,
    profile.service && `만드는 것 ${profile.service}`,
    profile.keywords.length > 0 && `관심사 ${profile.keywords.join(", ")}`,
  ].filter(Boolean);
  return `${profile.nickname} (${parts.join(" · ") || "정보 없음"})`;
}

function buildPrompt(me: BuilderProfile, others: BuilderProfile[]): string {
  const candidates = others
    .map((profile, index) => `${index + 1}. [${profile.cardId}] ${describe(profile)}`)
    .join("\n");

  return [
    "너는 개발자 행사 네트워킹 매칭 도우미야.",
    "아래 '나'와 가장 잘 맞는 Builder를 최대 3명 추천해줘.",
    "출력은 JSON 배열만. 각 원소는 {\"cardId\":\"...\",\"matchRate\":85,\"reason\":\"한 문장 이유\"} 형식.",
    "matchRate는 0~100 정수. reason은 한국어 한 문장. 다른 텍스트는 출력하지 마.",
    "",
    `[나] ${describe(me)}`,
    "",
    "[후보]",
    candidates,
  ].join("\n");
}

interface MatchResult {
  cardId: string;
  nickname: string;
  matchRate: number;
  reason: string;
}

function parseResults(raw: string, others: BuilderProfile[]): MatchResult[] {
  const byCardId = new Map(others.map((profile) => [profile.cardId, profile]));
  const jsonText = raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const results: MatchResult[] = [];
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;
    const cardId = String(record.cardId ?? "");
    const profile = byCardId.get(cardId);
    if (!profile) continue;
    const matchRate = Math.max(
      0,
      Math.min(100, Math.round(Number(record.matchRate) || 0)),
    );
    results.push({
      cardId,
      nickname: profile.nickname,
      matchRate,
      reason: String(record.reason ?? "").slice(0, 120),
    });
  }
  return results.slice(0, 3);
}
