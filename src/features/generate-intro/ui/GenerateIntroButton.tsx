"use client";

import { useState } from "react";
import { Button, Callout, Card, Flex, Text } from "@radix-ui/themes";
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
 *
 * `errorStatus` mirrors the HTTP status of the last failed request; it only
 * drives which presentation to show (regen-cap notice vs. amber degrade
 * callout vs. generic alert) and does not alter the request/cap logic.
 */
export function GenerateIntroButton({ cardId, initialIntro }: Props) {
  const [intro, setIntro] = useState<string | null>(initialIntro);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const handleGenerate = async () => {
    setStatus("loading");
    setError(null);
    setErrorStatus(null);
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
        setErrorStatus(response.status);
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

  const isCapReached = errorStatus === 429;
  const isUnavailable = errorStatus === 503;

  return (
    <Card size="2" variant="surface">
      <Flex direction="column" gap="2">
        {intro && (
          <Text as="p" size="3">
            {intro}
          </Text>
        )}
        <Flex>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={status === "loading" || isCapReached}
          >
            {status === "loading"
              ? "생성 중…"
              : intro
                ? "AI 소개 다시 생성"
                : "AI 한 줄 소개 생성"}
          </Button>
        </Flex>
        {isCapReached && (
          <Text color="gray" size="1">
            {error}
          </Text>
        )}
        {isUnavailable && (
          <Callout.Root color="amber" size="1">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        {error && !isCapReached && !isUnavailable && (
          <Text role="alert" color="red" size="1">
            {error}
          </Text>
        )}
      </Flex>
    </Card>
  );
}
