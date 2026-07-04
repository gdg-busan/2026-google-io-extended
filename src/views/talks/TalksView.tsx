"use client";

import { useAtomValue } from "jotai";
import { approvedTalksAtom } from "@/entities/talk";
import { ApplyTalkForm } from "@/features/apply-talk";

export function TalksView() {
  const talks = useAtomValue(approvedTalksAtom);

  return (
    <main>
      <h1>라이트닝 토크</h1>
      <ApplyTalkForm />
      <ul>
        {talks.map((talk) => (
          <li key={talk.id}>
            {talk.link ? (
              <a href={talk.link} target="_blank" rel="noopener noreferrer">
                {talk.title}
              </a>
            ) : (
              talk.title
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
