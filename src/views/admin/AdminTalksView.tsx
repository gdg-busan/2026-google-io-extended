"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  Box,
  Button,
  Flex,
  Heading,
  Table,
  TextField,
} from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";

export interface AdminTalkRow {
  id: string;
  title: string;
  link: string | null;
  status: "pending" | "approved";
  order: number | null;
}

type Props = { talks: AdminTalkRow[] };

/**
 * /admin/talks (task #6): approve/reject applications + reorder approved
 * talks. All mutations go through /api/admin/talks/[id] (Admin SDK writes
 * — the security rules deny client writes to status/order entirely).
 */
export function AdminTalksView({ talks }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const pending = talks.filter((talk) => talk.status === "pending");
  const approved = [...talks]
    .filter((talk) => talk.status === "approved")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleApprove = async (id: string) => {
    setPendingId(id);
    try {
      await fetch(`/api/admin/talks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", order: approved.length }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setPendingId(id);
    try {
      await fetch(`/api/admin/talks/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const handleOrderChange = async (id: string, order: number) => {
    setPendingId(id);
    try {
      await fetch(`/api/admin/talks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Flex direction="column">
      <PageHeader title="라이트닝 토크 관리" />
      <Box mb="6">
        <Heading as="h2" size="3" mb="3" color="gray" highContrast>
          대기 중 ({pending.length})
        </Heading>
        <Box overflowX="auto">
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>링크</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>동작</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pending.map((talk) => (
                <Table.Row key={talk.id}>
                  <Table.RowHeaderCell>{talk.title}</Table.RowHeaderCell>
                  <Table.Cell>
                    {talk.link && (
                      <Button asChild size="1" variant="ghost">
                        <a
                          href={talk.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          링크
                        </a>
                      </Button>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button
                        type="button"
                        size="1"
                        disabled={pendingId === talk.id}
                        onClick={() => handleApprove(talk.id)}
                      >
                        승인
                      </Button>
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <Button
                            type="button"
                            size="1"
                            color="red"
                            variant="soft"
                            disabled={pendingId === talk.id}
                          >
                            거절
                          </Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content maxWidth="450px">
                          <AlertDialog.Title>토크 신청 거절</AlertDialog.Title>
                          <AlertDialog.Description size="2">
                            {`"${talk.title}" 신청을 거절하고 삭제합니다. 되돌릴 수 없습니다.`}
                          </AlertDialog.Description>
                          <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                              <Button variant="soft" color="gray">
                                취소
                              </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <Button
                                variant="solid"
                                color="red"
                                onClick={() => handleReject(talk.id)}
                              >
                                거절
                              </Button>
                            </AlertDialog.Action>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
      <Box>
        <Heading as="h2" size="3" mb="3" color="gray" highContrast>
          승인됨 ({approved.length})
        </Heading>
        <Box overflowX="auto">
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>순서</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>동작</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {approved.map((talk) => (
                <Table.Row key={talk.id}>
                  <Table.RowHeaderCell>{talk.title}</Table.RowHeaderCell>
                  <Table.Cell>
                    <TextField.Root
                      type="number"
                      min={0}
                      defaultValue={talk.order ?? 0}
                      disabled={pendingId === talk.id}
                      style={{ maxWidth: 80 }}
                      onBlur={(event) =>
                        handleOrderChange(talk.id, Number(event.target.value))
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <Button
                          type="button"
                          size="1"
                          color="red"
                          variant="soft"
                          disabled={pendingId === talk.id}
                        >
                          제거
                        </Button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content maxWidth="450px">
                        <AlertDialog.Title>승인된 토크 제거</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                          {`"${talk.title}"을(를) 목록에서 제거합니다. 되돌릴 수 없습니다.`}
                        </AlertDialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                          <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">
                              취소
                            </Button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action>
                            <Button
                              variant="solid"
                              color="red"
                              onClick={() => handleReject(talk.id)}
                            >
                              제거
                            </Button>
                          </AlertDialog.Action>
                        </Flex>
                      </AlertDialog.Content>
                    </AlertDialog.Root>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </Flex>
  );
}
