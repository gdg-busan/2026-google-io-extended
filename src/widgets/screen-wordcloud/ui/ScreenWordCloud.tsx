"use client";

import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { wordcloudKeywordsAtom } from "@/entities/keyword";
import { useDebouncedValue } from "@/shared/lib";
import styles from "./ScreenWordCloud.module.css";

const RENDER_DEBOUNCE_MS = 2000;
const MIN_FONT_REM = 1.6;
const MAX_FONT_REM = 7;

interface AggregatedWord {
  text: string;
  count: number;
  fontRem: number;
  seed: number;
}

/**
 * Big-screen word cloud (task #5). Aggregates the live wordcloud keyword
 * feed by text, sizes each word by frequency, and debounces the render so
 * the projector doesn't churn on every Firestore snapshot.
 */
export function ScreenWordCloud() {
  const keywords = useAtomValue(wordcloudKeywordsAtom);
  const debounced = useDebouncedValue(keywords, RENDER_DEBOUNCE_MS);

  const words = useMemo<AggregatedWord[]>(() => {
    const counts = new Map<string, number>();
    for (const keyword of debounced) {
      const text = keyword.text.trim();
      if (!text) continue;
      counts.set(text, (counts.get(text) ?? 0) + 1);
    }

    const entries = [...counts.entries()];
    if (entries.length === 0) return [];

    const maxCount = Math.max(...entries.map(([, count]) => count));
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60)
      .map(([text, count], index) => ({
        text,
        count,
        fontRem:
          MIN_FONT_REM +
          (MAX_FONT_REM - MIN_FONT_REM) * (count / maxCount),
        // Deterministic per-word hue so re-renders don't flicker colors.
        seed: (text.charCodeAt(0) * 47 + index * 137) % 360,
      }));
  }, [debounced]);

  if (words.length === 0) {
    return (
      <div className={styles.empty}>
        <p>키워드를 기다리는 중…</p>
        <span>QR을 찍고 첫 키워드를 남겨보세요</span>
      </div>
    );
  }

  return (
    <div className={styles.cloud}>
      {words.map((word) => (
        <span
          key={word.text}
          className={styles.word}
          style={{
            fontSize: `${word.fontRem.toFixed(2)}rem`,
            color: `oklch(72% 0.17 ${word.seed})`,
          }}
          title={`${word.count}회`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
