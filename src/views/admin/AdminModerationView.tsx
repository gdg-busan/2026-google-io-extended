"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ModerationRow {
  id: string;
  label: string;
  hidden: boolean;
}

type ModerationCollection = "cards" | "questions" | "keywords";

type Props = {
  cards: ModerationRow[];
  questions: ModerationRow[];
  keywords: ModerationRow[];
};

const SECTIONS: { key: ModerationCollection; labelKo: string }[] = [
  { key: "cards", labelKo: "명함" },
  { key: "questions", labelKo: "질문" },
  { key: "keywords", labelKo: "키워드" },
];

/**
 * /admin/moderation (task #6): hidden toggle for cards/questions/keywords.
 * Mutations go through /api/admin/{collection}/[id] (Admin SDK writes).
 */
export function AdminModerationView({ cards, questions, keywords }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const rowsByCollection: Record<ModerationCollection, ModerationRow[]> = {
    cards,
    questions,
    keywords,
  };

  const handleToggle = async (
    collection: ModerationCollection,
    id: string,
    hidden: boolean,
  ) => {
    setPendingId(id);
    try {
      await fetch(`/api/admin/${collection}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  return (
    <main>
      <h1>모더레이션</h1>
      {SECTIONS.map(({ key, labelKo }) => (
        <section key={key}>
          <h2>{labelKo}</h2>
          <ul>
            {rowsByCollection[key].map((row) => (
              <li key={row.id}>
                <span>{row.label}</span>
                <span>{row.hidden ? "숨김" : "공개"}</span>
                <button
                  type="button"
                  disabled={pendingId === row.id}
                  onClick={() => handleToggle(key, row.id, !row.hidden)}
                >
                  {row.hidden ? "공개로 전환" : "숨기기"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
