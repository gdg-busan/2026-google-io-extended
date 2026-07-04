"use client";

import { useState } from "react";
import { authedFetch } from "@/shared/lib/authed-fetch";

interface Props {
  cardId: string;
  initialIntro: string | null;
}

/**
 * AI badge one-liner control (task #7). Calls /api/gemini/intro and shows
 * the Gemini-generated intro, or a friendly message + retry when the
 * feature is unavailable (no API key → 503) — the card stays fully usable
 * either way (plan: graceful degrade).
 */
export function GenerateIntroButton({ cardId, initialIntro }: Props) {
  const [intro, setIntro] = useState<string | null>(initialIntro);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await authedFetch("/api/gemini/intro", {
        method: "POST",
        body: JSON.stringify({ cardId }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        aiIntro?: string;
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "AI 소개 생성에 실패했어요.");
        return;
      }
      setIntro(data.aiIntro ?? null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI 소개 생성에 실패했어요.",
      );
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div>
      {intro && <p>{intro}</p>}
      <button type="button" onClick={handleGenerate} disabled={status === "loading"}>
        {status === "loading"
          ? "생성 중…"
          : intro
            ? "AI 소개 다시 생성"
            : "AI 한 줄 소개 생성"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
