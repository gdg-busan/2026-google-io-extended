"use client";

import { Flex } from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";
import { BingoBoard } from "@/features/check-bingo";

/** I/O Bingo page (task #7). */
export function BingoView() {
  return (
    <Flex direction="column">
      <PageHeader
        title="Google I/O Bingo"
        subtitle="키노트에서 들리는 키워드를 눌러 빙고를 채워보세요."
      />
      <BingoBoard />
    </Flex>
  );
}
