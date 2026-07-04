"use client";

import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { Button, Flex, Grid, Text } from "@radix-ui/themes";
import { BINGO_SIZE, myBingoAtom } from "@/entities/bingo";
import { useSession } from "@/entities/session";
import { countBingoLines, initBingo, toggleCell } from "../model/bingo-actions";

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
    return (
      <Text as="p" color="gray">
        불러오는 중…
      </Text>
    );
  }
  if (!bingo) {
    return (
      <Text as="p" color="gray">
        빙고판을 준비하고 있어요…
      </Text>
    );
  }

  const lines = countBingoLines(bingo.checks);

  return (
    <Flex direction="column" gap="3">
      {lines > 0 && (
        <Text as="p" size="5" weight="bold" color="blue">
          빙고 {lines}줄 완성! 🎉
        </Text>
      )}
      <Grid columns={String(BINGO_SIZE)} gap="2" style={{ maxWidth: "32rem" }}>
        {bingo.grid.map((label, index) => {
          const isChecked = bingo.checks[index] === true;
          return (
            <Button
              key={`${label}-${index}`}
              type="button"
              variant={isChecked ? "soft" : "surface"}
              color={isChecked ? "blue" : "gray"}
              aria-pressed={isChecked}
              onClick={() => uid && toggleCell(uid, bingo.checks, index)}
              style={{
                aspectRatio: "1",
                height: "auto",
                width: "100%",
                whiteSpace: "normal",
                fontSize: "clamp(0.6rem, 2.5vw, 0.9rem)",
                lineHeight: 1.1,
                padding: "0.25rem",
              }}
            >
              {label}
            </Button>
          );
        })}
      </Grid>
    </Flex>
  );
}
