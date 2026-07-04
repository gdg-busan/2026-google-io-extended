"use client";

import { useAtomValue } from "jotai";
import { useState } from "react";
import { Flex, IconButton, Text } from "@radix-ui/themes";
import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";
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
    <Flex align="center" gap="1">
      <IconButton
        type="button"
        variant="ghost"
        color={isLiked ? "red" : "gray"}
        onClick={handleClick}
        disabled={!uid || isLiked || isSubmitting}
        aria-pressed={isLiked}
        aria-label={isLiked ? "좋아요 취소 불가" : "좋아요"}
      >
        {isLiked ? <HeartFilledIcon /> : <HeartIcon />}
      </IconButton>
      <Text size="2" color="gray">
        {count}
      </Text>
    </Flex>
  );
}
