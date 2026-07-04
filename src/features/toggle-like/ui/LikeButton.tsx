"use client";

import { useAtomValue } from "jotai";
import { useState } from "react";
import { likeCountsAtom } from "@/entities/like";
import { uidAtom } from "@/entities/session";
import { likeQuestion } from "../model/like-question";
import { myLikedQuestionIdsAtom } from "../model/atoms";

interface LikeButtonProps {
  questionId: string;
}

export function LikeButton({ questionId }: LikeButtonProps) {
  const uid = useAtomValue(uidAtom);
  const likeCounts = useAtomValue(likeCountsAtom);
  const likedQuestionIds = useAtomValue(myLikedQuestionIdsAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLiked = likedQuestionIds.has(questionId);
  const count = likeCounts[questionId] ?? 0;

  const handleClick = async () => {
    if (!uid || isLiked || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await likeQuestion(questionId, uid);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!uid || isLiked || isSubmitting}
      aria-pressed={isLiked}
    >
      {isLiked ? "♥" : "♡"} {count}
    </button>
  );
}
