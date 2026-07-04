"use client";

import { useAtomValue } from "jotai";
import { useState, type FormEvent } from "react";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useSession } from "@/entities/session";
import { isKeywordCapReachedAtom, usedKeywordSlotIndicesAtom } from "../model/atoms";
import { MAX_KEYWORD_LENGTH, submitKeyword } from "../model/submit-keyword";

const SUGGESTED_KEYWORDS = ["Gemini", "AI Agent", "MCP", "Frontend", "Startup", "Flutter"];

export function NetworkingKeywordPicker() {
  const { uid, isReady } = useSession();
  const isCapReached = useAtomValue(isKeywordCapReachedAtom);
  const usedSlotIndices = useAtomValue(usedKeywordSlotIndicesAtom);
  const [customText, setCustomText] = useState("");
  const [pendingKeyword, setPendingKeyword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isCapReached) {
    return <Text color="gray">키워드를 최대 개수만큼 제출했어요.</Text>;
  }

  const submit = async (text: string) => {
    if (!uid) return;
    setPendingKeyword(text);
    setError(null);
    try {
      await submitKeyword({ uid, text, type: "networking", usedSlotIndices });
      setCustomText("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "제출에 실패했어요.",
      );
    } finally {
      setPendingKeyword(null);
    }
  };

  const handleCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(customText);
  };

  return (
    <Flex direction="column" gap="3">
      <Flex wrap="wrap" gap="2" role="group" aria-label="추천 키워드">
        {SUGGESTED_KEYWORDS.map((keyword) => (
          <Button
            key={keyword}
            type="button"
            variant="surface"
            onClick={() => submit(keyword)}
            disabled={!isReady || pendingKeyword !== null}
          >
            {keyword}
          </Button>
        ))}
      </Flex>
      <form onSubmit={handleCustomSubmit}>
        <Flex gap="2">
          <TextField.Root
            value={customText}
            onChange={(event) => setCustomText(event.target.value)}
            maxLength={MAX_KEYWORD_LENGTH}
            placeholder="직접 입력"
            disabled={!isReady || pendingKeyword !== null}
            style={{ flexGrow: 1 }}
          />
          <Button
            type="submit"
            disabled={!uid || pendingKeyword !== null || !customText.trim()}
          >
            추가
          </Button>
        </Flex>
      </form>
      {error ? (
        <Text color="red" size="1" role="alert">
          {error}
        </Text>
      ) : null}
    </Flex>
  );
}
