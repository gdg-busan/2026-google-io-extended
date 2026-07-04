"use client";

import { useAtomValue } from "jotai";
import { useState } from "react";
import { Avatar, Badge, Button, Callout, Card, Flex, Text } from "@radix-ui/themes";
import { myMatchesAtom } from "@/entities/match";
import { authedFetch } from "@/shared/lib/authed-fetch";
import { myCardIdAtom } from "../model/my-card";

/**
 * Builder Match panel (task #7). Triggers server-side Gemini matching and
 * renders the cached results (read from matches/{uid}). Degrades cleanly
 * when AI is unavailable or the user has no card yet.
 *
 * `errorStatus` mirrors the HTTP status of the last failed request; it only
 * drives which presentation to show (amber degrade callout vs. generic
 * alert) and does not alter the request/matching logic.
 */
export function MatchPanel() {
  const matches = useAtomValue(myMatchesAtom);
  const myCardId = useAtomValue(myCardIdAtom);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const handleMatch = async () => {
    if (!myCardId) {
      setError("먼저 명함을 등록해 주세요.");
      return;
    }
    setStatus("loading");
    setError(null);
    setErrorStatus(null);
    try {
      const response = await authedFetch("/api/gemini/match", {
        method: "POST",
        body: JSON.stringify({ cardId: myCardId }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "매칭에 실패했어요.");
        setErrorStatus(response.status);
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
  const isUnavailable = errorStatus === 503;

  return (
    <Flex direction="column" gap="3">
      <Flex>
        <Button
          type="button"
          onClick={handleMatch}
          disabled={status === "loading" || !myCardId}
        >
          {status === "loading" ? "매칭 중…" : "나와 비슷한 Builder 찾기"}
        </Button>
      </Flex>
      {!myCardId && (
        <Text as="p" size="2" color="gray">
          명함을 등록하면 매칭을 사용할 수 있어요.
        </Text>
      )}
      {isUnavailable && (
        <Callout.Root color="amber" size="1">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      {error && !isUnavailable && (
        <Text role="alert" color="red" size="2">
          {error}
        </Text>
      )}
      <Flex direction="column" gap="2">
        {results.map((result) => (
          <Card key={result.cardId} size="2" variant="surface">
            <Flex align="center" gap="3">
              <Avatar
                size="3"
                radius="full"
                fallback={result.nickname.slice(0, 2).toUpperCase()}
                color="blue"
              />
              <Flex direction="column" gap="1" flexGrow="1">
                <Flex align="center" gap="2">
                  <Text weight="bold" size="2">
                    {result.nickname}
                  </Text>
                  <Badge color="blue" variant="soft">
                    매칭률 {result.matchRate}%
                  </Badge>
                </Flex>
                <Text as="p" size="2" color="gray">
                  {result.reason}
                </Text>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
