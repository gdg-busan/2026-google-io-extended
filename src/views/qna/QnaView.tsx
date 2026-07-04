"use client";

import { useAtomValue } from "jotai";
import { Card, Flex, Text } from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";
import { likeCountsAtom } from "@/entities/like";
import { questionsAtom } from "@/entities/question";
import { AskQuestionForm } from "@/features/ask-question";
import { LikeButton } from "@/features/toggle-like";

export function QnaView() {
  const questions = useAtomValue(questionsAtom);
  const likeCounts = useAtomValue(likeCountsAtom);

  // questionsAtom already arrives ordered oldest-first from Firestore, and
  // Array#sort is stable, so ties in like count keep that createdAt order —
  // no need to touch the (possibly still-pending) createdAt timestamp here.
  const sortedQuestions = [...questions].sort(
    (a, b) => (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0),
  );

  return (
    <main>
      <PageHeader title="Q&A" subtitle="궁금한 점을 질문하고 좋아요를 눌러보세요" />
      <AskQuestionForm />
      <Flex direction="column" gap="3" mt="4">
        {sortedQuestions.map((question) => (
          <Card key={question.id} size="2" variant="surface">
            <Flex align="center" justify="between" gap="3">
              <Text as="p" size="2">
                {question.text}
              </Text>
              <LikeButton questionId={question.id} />
            </Flex>
          </Card>
        ))}
      </Flex>
    </main>
  );
}
