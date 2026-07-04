"use client";

import { useAtomValue } from "jotai";
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
      <h1>Q&A</h1>
      <AskQuestionForm />
      <ul>
        {sortedQuestions.map((question) => (
          <li key={question.id}>
            <p>{question.text}</p>
            <LikeButton questionId={question.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
