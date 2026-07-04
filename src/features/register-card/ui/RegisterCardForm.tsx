"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useSession } from "@/entities/session";
import type { CardInput } from "@/entities/card";
import { registerCard } from "../api/register-card";

type FormState = CardInput;

const initialFormState: FormState = {
  nickname: "",
  company: "",
  role: "",
  github: "",
  linkedin: "",
  service: "",
};

export function RegisterCardForm() {
  const { uid, isReady } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uid || !form.nickname.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await registerCard(uid, {
        nickname: form.nickname.trim(),
        company: form.company?.trim() || undefined,
        role: form.role?.trim() || undefined,
        github: form.github?.trim() || undefined,
        linkedin: form.linkedin?.trim() || undefined,
        service: form.service?.trim() || undefined,
      });
      setRecoveryToken(`${result.cardId}.${result.recoveryCode}`);
    } catch {
      setError("명함 등록에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return <Text color="gray">불러오는 중...</Text>;
  }

  if (recoveryToken) {
    return (
      <Flex direction="column" gap="3">
        <Text as="p" weight="bold" size="4">
          명함이 등록되었습니다
        </Text>
        <Text as="p" size="2" color="gray">
          아래 복구 코드는 다시 표시되지 않습니다. 다른 기기에서 이 명함을
          되찾을 때 필요하니 꼭 저장해 두세요.
        </Text>
        <Text as="p" weight="bold" size="3">
          {recoveryToken}
        </Text>
        <Button type="button" onClick={() => router.push("/cards")}>
          명함 목록으로
        </Button>
      </Flex>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        <Text as="label" size="2" weight="medium">
          닉네임 (필수)
          <TextField.Root
            mt="1"
            value={form.nickname}
            onChange={(event) => handleChange("nickname", event.target.value)}
            required
            maxLength={40}
          />
        </Text>
        <Text as="label" size="2" weight="medium">
          회사
          <TextField.Root
            mt="1"
            value={form.company}
            onChange={(event) => handleChange("company", event.target.value)}
          />
        </Text>
        <Text as="label" size="2" weight="medium">
          하는 일
          <TextField.Root
            mt="1"
            value={form.role}
            onChange={(event) => handleChange("role", event.target.value)}
          />
        </Text>
        <Text as="label" size="2" weight="medium">
          GitHub
          <TextField.Root
            mt="1"
            value={form.github}
            onChange={(event) => handleChange("github", event.target.value)}
          />
        </Text>
        <Text as="label" size="2" weight="medium">
          LinkedIn
          <TextField.Root
            mt="1"
            value={form.linkedin}
            onChange={(event) => handleChange("linkedin", event.target.value)}
          />
        </Text>
        <Text as="label" size="2" weight="medium">
          서비스
          <TextField.Root
            mt="1"
            value={form.service}
            onChange={(event) => handleChange("service", event.target.value)}
          />
        </Text>
        {error ? (
          <Text color="red" size="1" role="alert">
            {error}
          </Text>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !form.nickname.trim()}>
          {isSubmitting ? "등록 중..." : "명함 등록"}
        </Button>
      </Flex>
    </form>
  );
}
