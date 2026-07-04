"use client";

import { useAtomValue } from "jotai";
import { useId, useState } from "react";
import {
  AlertDialog,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Select,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";
import { archiveItemsAtom, type ArchiveType } from "@/entities/archive";

const TYPE_OPTIONS: { value: ArchiveType; label: string }[] = [
  { value: "slide", label: "발표 자료" },
  { value: "photo", label: "행사 사진" },
  { value: "discord", label: "커뮤니티" },
];

const TYPE_BADGE_COLOR: Record<ArchiveType, "blue" | "green" | "amber"> = {
  slide: "blue",
  photo: "green",
  discord: "amber",
};

/**
 * Admin archive manager (task #8): add a titled URL record (slides/photos/
 * Discord) or delete one. Same-origin admin API calls carry the session
 * cookie automatically; the handlers verify it server-side.
 */
export function AdminArchiveView() {
  const items = useAtomValue(archiveItemsAtom);
  const [type, setType] = useState<ArchiveType>("slide");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const typeSelectId = useId();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, url }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "추가에 실패했어요.");
        return;
      }
      setTitle("");
      setUrl("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/archive/${id}`, { method: "DELETE" });
  };

  return (
    <Flex direction="column">
      <PageHeader title="아카이브 관리" />

      <Card size="2" mb="6">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <Box>
              <Text as="label" size="2" weight="medium" htmlFor={typeSelectId}>
                구분
              </Text>
              <Box mt="1">
                <Select.Root
                  value={type}
                  onValueChange={(value) => setType(value as ArchiveType)}
                >
                  <Select.Trigger id={typeSelectId} />
                  <Select.Content>
                    {TYPE_OPTIONS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
            </Box>
            <Text as="label" size="2" weight="medium">
              제목
              <TextField.Root
                mt="1"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="제목"
                required
              />
            </Text>
            <Text as="label" size="2" weight="medium">
              URL
              <TextField.Root
                mt="1"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                type="url"
                required
              />
            </Text>
            <Flex direction="column" gap="2" align="start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "추가 중…" : "추가"}
              </Button>
              {error && (
                <Text role="alert" size="1" color="red">
                  {error}
                </Text>
              )}
            </Flex>
          </Flex>
        </form>
      </Card>

      <Box overflowX="auto">
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>구분</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>동작</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>
                  <Badge color={TYPE_BADGE_COLOR[item.type]} variant="soft">
                    {TYPE_OPTIONS.find((option) => option.value === item.type)?.label ??
                      item.type}
                  </Badge>
                </Table.Cell>
                <Table.RowHeaderCell>{item.title}</Table.RowHeaderCell>
                <Table.Cell>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <Button type="button" size="1" color="red" variant="soft">
                        삭제
                      </Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content maxWidth="450px">
                      <AlertDialog.Title>아카이브 항목 삭제</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        {`"${item.title}" 항목을 삭제합니다. 되돌릴 수 없습니다.`}
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
                            onClick={() => handleDelete(item.id)}
                          >
                            삭제
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
    </Flex>
  );
}
