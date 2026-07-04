"use client";

import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/shared/firebase";
import { BINGO_KEYWORDS, BINGO_SIZE } from "@/entities/bingo";

const CELL_COUNT = BINGO_SIZE * BINGO_SIZE;

/** Creates bingo/{uid} with a freshly shuffled grid if it doesn't exist yet. */
export async function initBingo(uid: string): Promise<void> {
  const shuffled = [...BINGO_KEYWORDS];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const grid = shuffled.slice(0, CELL_COUNT);
  await setDoc(
    doc(db, "bingo", uid),
    { grid, checks: new Array(CELL_COUNT).fill(false) },
    { merge: false },
  );
}

/** Toggles one cell's checked state. */
export async function toggleCell(
  uid: string,
  checks: boolean[],
  index: number,
): Promise<void> {
  const next = [...checks];
  next[index] = !next[index];
  await updateDoc(doc(db, "bingo", uid), { checks: next });
}

/** Counts completed bingo lines (rows, cols, both diagonals). */
export function countBingoLines(checks: boolean[]): number {
  const size = BINGO_SIZE;
  const at = (row: number, col: number) => checks[row * size + col] === true;
  let lines = 0;

  for (let row = 0; row < size; row += 1) {
    if (Array.from({ length: size }, (_, col) => at(row, col)).every(Boolean)) {
      lines += 1;
    }
  }
  for (let col = 0; col < size; col += 1) {
    if (Array.from({ length: size }, (_, row) => at(row, col)).every(Boolean)) {
      lines += 1;
    }
  }
  if (Array.from({ length: size }, (_, i) => at(i, i)).every(Boolean)) {
    lines += 1;
  }
  if (Array.from({ length: size }, (_, i) => at(i, size - 1 - i)).every(Boolean)) {
    lines += 1;
  }
  return lines;
}
