"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession } from "@/entities/session";
import { parseRecoveryToken, recoverCard } from "../api/recover-card";

export function RecoverCardForm() {
  const { isReady } = useSession();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeededCardId, setSucceededCardId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseRecoveryToken(token);
    if (!parsed) {
      setError("복구 코드 형식이 올바르지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await recoverCard(parsed.cardId, parsed.code);
      setSucceededCardId(parsed.cardId);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "복구에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return <p>불러오는 중...</p>;
  }

  if (succeededCardId) {
    return (
      <section>
        <h2>명함을 복구했습니다</h2>
        <button
          type="button"
          onClick={() => router.push(`/cards/${succeededCardId}`)}
        >
          내 명함 보기
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        복구 코드
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="예: aBcD1234.7K3M9PQR"
          required
        />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={isSubmitting || !token.trim()}>
        {isSubmitting ? "복구 중..." : "명함 복구"}
      </button>
    </form>
  );
}
