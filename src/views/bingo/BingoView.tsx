"use client";

import { BingoBoard } from "@/features/check-bingo";

/** I/O Bingo page (task #7). */
export function BingoView() {
  return (
    <main>
      <h1>Google I/O Bingo</h1>
      <p>키노트에서 들리는 키워드를 눌러 빙고를 채워보세요.</p>
      <BingoBoard />
    </main>
  );
}
