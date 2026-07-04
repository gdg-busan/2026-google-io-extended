/**
 * Builder Passport missions (task #7). Static for a single event (plan
 * YAGNI: no multi-tenant config). Shown as networking guidance; the tracked
 * mechanic is the number of distinct builders connected via QR scan.
 */
export interface Mission {
  id: string;
  label: string;
}

export const MISSIONS: readonly Mission[] = [
  { id: "ai-service", label: "AI 서비스를 운영하는 사람 만나기" },
  { id: "gemini", label: "Gemini API를 써본 사람 만나기" },
  { id: "founder", label: "창업을 준비하는 사람 만나기" },
  { id: "flutter", label: "Flutter 개발자 만나기" },
  { id: "io-onsite", label: "Google I/O 현장 참가자 만나기" },
];

/** Distinct connections required before the raffle entry unlocks. */
export const RAFFLE_CONNECTION_THRESHOLD = 3;
