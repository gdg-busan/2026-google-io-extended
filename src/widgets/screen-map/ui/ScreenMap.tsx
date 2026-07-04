"use client";

import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { Heading, Text } from "@radix-ui/themes";
import { cardsListAtom } from "@/entities/card";
import { useDebouncedValue } from "@/shared/lib";
import styles from "./ScreenMap.module.css";

const RENDER_DEBOUNCE_MS = 2000;
const MAX_FLOATERS = 40;

interface Floater {
  id: string;
  nickname: string;
  role: string | null;
  service: string | null;
  left: number;
  top: number;
  delay: number;
  duration: number;
  hue: number;
}

/**
 * Big-screen "Builder Map" (task #5): floating cards drifting across the
 * projector so people can spot each other during networking. Only
 * `transform`/`opacity` animate (compositor-friendly, plan requirement);
 * positions are derived deterministically from each card id so re-renders
 * don't reshuffle everyone.
 */
export function ScreenMap() {
  const cards = useAtomValue(cardsListAtom);
  const debounced = useDebouncedValue(cards, RENDER_DEBOUNCE_MS);

  const floaters = useMemo<Floater[]>(() => {
    return debounced.slice(0, MAX_FLOATERS).map((card, index) => {
      const hash = hashString(card.id);
      return {
        id: card.id,
        nickname: card.nickname,
        role: card.role,
        service: card.service,
        left: 4 + (hash % 88),
        top: 6 + ((hash >> 3) % 80),
        delay: (hash % 4000) / 1000,
        duration: 7 + ((hash >> 5) % 6),
        hue: (index * 47 + (hash % 60)) % 360,
      };
    });
  }, [debounced]);

  if (floaters.length === 0) {
    return (
      <div className={styles.empty}>
        <Heading as="h2" size="9" align="center">
          아직 등록된 Builder가 없어요
        </Heading>
        <Text size="6" color="gray" align="center">
          명함을 등록하면 이 화면에 떠올라요
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.map}>
      {floaters.map((floater) => (
        <div
          key={floater.id}
          className={styles.floater}
          style={{
            left: `${floater.left}%`,
            top: `${floater.top}%`,
            animationDelay: `${floater.delay}s`,
            animationDuration: `${floater.duration}s`,
            borderColor: `oklch(70% 0.15 ${floater.hue})`,
          }}
        >
          <strong>{floater.nickname}</strong>
          {floater.role && <span>{floater.role}</span>}
          {floater.service && <em>{floater.service}</em>}
        </div>
      ))}
    </div>
  );
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}
