"use client";

import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { BINGO_SIZE, myBingoAtom } from "@/entities/bingo";
import { useSession } from "@/entities/session";
import { countBingoLines, initBingo, toggleCell } from "../model/bingo-actions";
import styles from "./BingoBoard.module.css";

/**
 * I/O Bingo board (task #7). Generates the grid on first visit, then lets
 * the attendee check keywords as they hear them in the keynote. Win state
 * = one or more completed lines.
 */
export function BingoBoard() {
  const { uid, isReady } = useSession();
  const bingo = useAtomValue(myBingoAtom);
  const initStartedRef = useRef(false);

  useEffect(() => {
    if (!uid || !isReady || bingo || initStartedRef.current) return;
    initStartedRef.current = true;
    void initBingo(uid).catch(() => {
      initStartedRef.current = false;
    });
  }, [uid, isReady, bingo]);

  if (!isReady) {
    return <p>불러오는 중…</p>;
  }
  if (!bingo) {
    return <p>빙고판을 준비하고 있어요…</p>;
  }

  const lines = countBingoLines(bingo.checks);

  return (
    <div>
      {lines > 0 && <p className={styles.win}>빙고 {lines}줄 완성! 🎉</p>}
      <div
        className={styles.board}
        style={{ gridTemplateColumns: `repeat(${BINGO_SIZE}, 1fr)` }}
      >
        {bingo.grid.map((label, index) => (
          <button
            key={`${label}-${index}`}
            type="button"
            className={styles.cell}
            data-checked={bingo.checks[index] === true}
            onClick={() => uid && toggleCell(uid, bingo.checks, index)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
