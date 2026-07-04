"use client";

import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { Heading, Text } from "@radix-ui/themes";
import { cardsListAtom } from "@/entities/card";
import { networkingKeywordsAtom } from "@/entities/keyword";
import { useDebouncedValue } from "@/shared/lib";
import styles from "./ScreenFeed.module.css";

const RENDER_DEBOUNCE_MS = 2000;
const MAX_ITEMS = 24;

interface FeedItem {
  key: string;
  kind: "builder" | "keyword";
  primary: string;
  secondary: string | null;
  sortAt: number;
}

/**
 * Big-screen live feed (task #5): newest builders and networking keywords
 * streamed together, Slack-style. Debounced render; `cardsListAtom` is
 * already newest-first so we read createdAt for interleaving.
 */
export function ScreenFeed() {
  const cards = useAtomValue(cardsListAtom);
  const keywords = useAtomValue(networkingKeywordsAtom);
  const debouncedCards = useDebouncedValue(cards, RENDER_DEBOUNCE_MS);
  const debouncedKeywords = useDebouncedValue(keywords, RENDER_DEBOUNCE_MS);

  const items = useMemo<FeedItem[]>(() => {
    const builderItems: FeedItem[] = debouncedCards.map((card) => ({
      key: `card-${card.id}`,
      kind: "builder",
      primary: card.nickname,
      secondary: card.service ?? card.role ?? card.company,
      sortAt: card.createdAt?.toMillis?.() ?? 0,
    }));

    const keywordItems: FeedItem[] = debouncedKeywords.map((keyword) => ({
      key: `kw-${keyword.id}`,
      kind: "keyword",
      primary: keyword.text,
      secondary: null,
      sortAt: keyword.createdAt?.toMillis?.() ?? 0,
    }));

    return [...builderItems, ...keywordItems]
      .sort((a, b) => b.sortAt - a.sortAt)
      .slice(0, MAX_ITEMS);
  }, [debouncedCards, debouncedKeywords]);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <Heading as="h2" size="9" align="center">
          피드가 곧 채워져요
        </Heading>
        <Text size="6" color="gray" align="center">
          명함 등록과 네트워킹 키워드가 여기 실시간으로 흘러요
        </Text>
      </div>
    );
  }

  return (
    <ul className={styles.feed}>
      {items.map((item) => (
        <li key={item.key} className={styles.item} data-kind={item.kind}>
          <span className={styles.badge}>
            {item.kind === "builder" ? "새 Builder" : "키워드"}
          </span>
          <strong>{item.primary}</strong>
          {item.secondary && <span className={styles.secondary}>{item.secondary}</span>}
        </li>
      ))}
    </ul>
  );
}
