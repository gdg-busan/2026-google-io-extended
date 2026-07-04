"use client";

import { useAtomValue } from "jotai";
import { useState, type FormEvent } from "react";
import { Badge, Button, Card, Flex, Text, TextField } from "@radix-ui/themes";
import { useSession } from "@/entities/session";
import type { TalkStatus } from "@/entities/talk";
import { applyTalk, MAX_TALK_TITLE_LENGTH } from "../model/apply-talk";
import { myTalkAtom } from "../model/atoms";

const STATUS_LABEL: Record<TalkStatus, string> = {
  pending: "검토 중",
  approved: "승인됨",
};

const STATUS_COLOR: Record<TalkStatus, "grass" | "amber"> = {
  pending: "amber",
  approved: "grass",
};

export function ApplyTalkForm() {
  const { uid, isReady } = useSession();
  const myTalk = useAtomValue(myTalkAtom);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (myTalk) {
    return (
      <Card size="2" variant="surface">
        <Flex align="center" justify="between" gap="3">
          <Text as="p" size="2">
            내 신청: <Text weight="bold">{myTalk.title}</Text>
          </Text>
          <Badge color={STATUS_COLOR[myTalk.status]} variant="soft">
            {STATUS_LABEL[myTalk.status]}
          </Badge>
        </Flex>
      </Card>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await applyTalk({ uid, title, link });
      setTitle("");
      setLink("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "신청에 실패했어요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="2">
        <TextField.Root
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={MAX_TALK_TITLE_LENGTH}
          placeholder="발표 제목"
          disabled={!isReady || isSubmitting}
          required
        />
        <TextField.Root
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="참고 링크 (선택)"
          disabled={!isReady || isSubmitting}
        />
        <Flex justify="end">
          <Button type="submit" disabled={!uid || isSubmitting || !title.trim()}>
            {isSubmitting ? "신청 중..." : "라이트닝 토크 신청"}
          </Button>
        </Flex>
        {error && (
          <Text role="alert" color="red" size="1">
            {error}
          </Text>
        )}
      </Flex>
    </form>
  );
}
