"use client";

import { useState, type FormEvent } from "react";
import { Button, Flex, Text, TextArea } from "@radix-ui/themes";
import { useSession } from "@/entities/session";
import { askQuestion, MAX_QUESTION_LENGTH } from "../model/ask-question";

export function AskQuestionForm() {
  const { uid, isReady } = useSession();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await askQuestion(uid, text);
      setText("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "질문 등록에 실패했어요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="2">
        <TextArea
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_QUESTION_LENGTH}
          placeholder="궁금한 점을 남겨주세요"
          disabled={!isReady || isSubmitting}
          required
        />
        <Flex justify="end">
          <Button type="submit" disabled={!uid || isSubmitting || !text.trim()}>
            {isSubmitting ? "등록 중..." : "질문 등록"}
          </Button>
        </Flex>
        {error && (
          <Text role="alert" color="red" size="1">
            {error}
          </Text>
        )}
      </Flex>
    </form>
  );
}
