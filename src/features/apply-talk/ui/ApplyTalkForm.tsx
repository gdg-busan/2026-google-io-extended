"use client";

import { useAtomValue } from "jotai";
import { useState, type FormEvent } from "react";
import { useSession } from "@/entities/session";
import type { TalkStatus } from "@/entities/talk";
import { applyTalk, MAX_TALK_TITLE_LENGTH } from "../model/apply-talk";
import { myTalkAtom } from "../model/atoms";

const STATUS_LABEL: Record<TalkStatus, string> = {
  pending: "검토 중",
  approved: "승인됨",
};

export function ApplyTalkForm() {
  const { uid, isReady } = useSession();
  const myTalk = useAtomValue(myTalkAtom);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (myTalk) {
    return (
      <p>
        내 신청: <strong>{myTalk.title}</strong> — {STATUS_LABEL[myTalk.status]}
      </p>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await applyTalk({ uid, title, link });
      setTitle("");
      setLink("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "신청에 실패했어요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={MAX_TALK_TITLE_LENGTH}
        placeholder="발표 제목"
        disabled={!isReady || isSubmitting}
        required
      />
      <input
        value={link}
        onChange={(event) => setLink(event.target.value)}
        placeholder="참고 링크 (선택)"
        disabled={!isReady || isSubmitting}
      />
      <button type="submit" disabled={!uid || isSubmitting || !title.trim()}>
        {isSubmitting ? "신청 중..." : "라이트닝 토크 신청"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
