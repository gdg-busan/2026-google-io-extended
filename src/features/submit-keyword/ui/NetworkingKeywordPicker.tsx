"use client";

import { useAtomValue } from "jotai";
import { useState, type FormEvent } from "react";
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
    return <p>키워드를 최대 개수만큼 제출했어요.</p>;
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
    <div>
      <div role="group" aria-label="추천 키워드">
        {SUGGESTED_KEYWORDS.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => submit(keyword)}
            disabled={!isReady || pendingKeyword !== null}
          >
            {keyword}
          </button>
        ))}
      </div>
      <form onSubmit={handleCustomSubmit}>
        <input
          value={customText}
          onChange={(event) => setCustomText(event.target.value)}
          maxLength={MAX_KEYWORD_LENGTH}
          placeholder="직접 입력"
          disabled={!isReady || pendingKeyword !== null}
        />
        <button type="submit" disabled={!uid || pendingKeyword !== null || !customText.trim()}>
          추가
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
