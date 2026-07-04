"use client";

import { useAtomValue } from "jotai";
import { useState } from "react";
import { myMatchesAtom } from "@/entities/match";
import { authedFetch } from "@/shared/lib/authed-fetch";
import { myCardIdAtom } from "../model/my-card";

/**
 * Builder Match panel (task #7). Triggers server-side Gemini matching and
 * renders the cached results (read from matches/{uid}). Degrades cleanly
 * when AI is unavailable or the user has no card yet.
 */
export function MatchPanel() {
  const matches = useAtomValue(myMatchesAtom);
  const myCardId = useAtomValue(myCardIdAtom);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async () => {
    if (!myCardId) {
      setError("먼저 명함을 등록해 주세요.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const response = await authedFetch("/api/gemini/match", {
        method: "POST",
        body: JSON.stringify({ cardId: myCardId }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "매칭에 실패했어요.");
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "매칭에 실패했어요.",
      );
    } finally {
      setStatus("idle");
    }
  };

  const results = matches?.results ?? [];

  return (
    <section>
      <button
        type="button"
        onClick={handleMatch}
        disabled={status === "loading" || !myCardId}
      >
        {status === "loading" ? "매칭 중…" : "나와 비슷한 Builder 찾기"}
      </button>
      {!myCardId && <p>명함을 등록하면 매칭을 사용할 수 있어요.</p>}
      {error && <p role="alert">{error}</p>}
      <ul>
        {results.map((result) => (
          <li key={result.cardId}>
            <strong>{result.nickname}</strong>
            <span> · 매칭률 {result.matchRate}%</span>
            <p>{result.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
