"use client";

import { useAtomValue } from "jotai";
import { useState, type FormEvent } from "react";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useSession } from "@/entities/session";
import { isKeywordCapReachedAtom, usedKeywordSlotIndicesAtom } from "../model/atoms";
import { MAX_KEYWORD_LENGTH, submitKeyword } from "../model/submit-keyword";

export function WordCloudSubmitForm() {
  const { uid, isReady } = useSession();
  const isCapReached = useAtomValue(isKeywordCapReachedAtom);
  const usedSlotIndices = useAtomValue(usedKeywordSlotIndicesAtom);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isCapReached) {
    return <Text color="gray">키워드를 최대 개수만큼 제출했어요.</Text>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitKeyword({ uid, text, type: "wordcloud", usedSlotIndices });
      setText("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "제출에 실패했어요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="2">
        <Flex gap="2">
          <TextField.Root
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX_KEYWORD_LENGTH}
            placeholder="워드클라우드에 올릴 키워드"
            aria-label="워드클라우드 키워드"
            disabled={!isReady || isSubmitting}
            required
            style={{ flexGrow: 1 }}
          />
          <Button type="submit" disabled={!uid || isSubmitting || !text.trim()}>
            {isSubmitting ? "제출 중..." : "제출"}
          </Button>
        </Flex>
        {error ? (
          <Text color="red" size="1" role="alert">
            {error}
          </Text>
        ) : null}
      </Flex>
    </form>
  );
}
