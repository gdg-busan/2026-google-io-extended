"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ScreenFeed } from "@/widgets/screen-feed";
import { ScreenMap } from "@/widgets/screen-map";
import { ScreenWordCloud } from "@/widgets/screen-wordcloud";
import styles from "./ScreenRotator.module.css";

const VIEWS = [
  { key: "wordcloud", label: "Word Cloud", render: () => <ScreenWordCloud /> },
  { key: "map", label: "Builder Map", render: () => <ScreenMap /> },
  { key: "feed", label: "Live Feed", render: () => <ScreenFeed /> },
] as const;

const DEFAULT_ROTATE_SECONDS = 30;

/**
 * Big-screen auto-cycler (task #5). `/screen?rotate=30` cycles the three
 * views every 30s; `/screen?rotate=0` (or the single-view routes) pins one.
 * Read-only projector surface — a refresh restores it instantly.
 */
export function ScreenRotator() {
  const searchParams = useSearchParams();
  const rotateParam = searchParams.get("rotate");
  const rotateSeconds =
    rotateParam === null ? DEFAULT_ROTATE_SECONDS : Number(rotateParam);
  const isRotating = Number.isFinite(rotateSeconds) && rotateSeconds > 0;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isRotating) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % VIEWS.length);
    }, rotateSeconds * 1000);
    return () => clearInterval(timer);
  }, [isRotating, rotateSeconds]);

  const active = VIEWS[index];

  return (
    <div className={styles.stage}>
      <div className={styles.viewport}>{active.render()}</div>
      {isRotating && (
        <div className={styles.dots} aria-hidden>
          {VIEWS.map((view, viewIndex) => (
            <span
              key={view.key}
              className={styles.dot}
              data-active={viewIndex === index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
