"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Box, Button, Flex, Heading, Table } from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";

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
    <Flex direction="column">
      <PageHeader title="모더레이션" />
      {SECTIONS.map(({ key, labelKo }) => (
        <Box key={key} mb="6">
          <Heading as="h2" size="3" mb="3" color="gray" highContrast>
            {labelKo}
          </Heading>
          <Box overflowX="auto">
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>내용</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>상태</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>동작</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rowsByCollection[key].map((row) => (
                  <Table.Row key={row.id}>
                    <Table.RowHeaderCell>{row.label}</Table.RowHeaderCell>
                    <Table.Cell>
                      <Badge color={row.hidden ? "gray" : "green"} variant="soft">
                        {row.hidden ? "숨김" : "공개"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        type="button"
                        size="1"
                        variant="soft"
                        disabled={pendingId === row.id}
                        onClick={() => handleToggle(key, row.id, !row.hidden)}
                      >
                        {row.hidden ? "공개로 전환" : "숨기기"}
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      ))}
    </Flex>
  );
}
