"use client";

import { useAtomValue } from "jotai";
import { useState, type FormEvent } from "react";
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
    return <p>키워드를 최대 개수만큼 제출했어요.</p>;
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
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={MAX_KEYWORD_LENGTH}
        placeholder="워드클라우드에 올릴 키워드"
        disabled={!isReady || isSubmitting}
        required
      />
      <button type="submit" disabled={!uid || isSubmitting || !text.trim()}>
        {isSubmitting ? "제출 중..." : "제출"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
