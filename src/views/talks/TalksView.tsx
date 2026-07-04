"use client";

import { useAtomValue } from "jotai";
import { Card, Flex, Text } from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";
import { approvedTalksAtom } from "@/entities/talk";
import { ApplyTalkForm } from "@/features/apply-talk";

export function TalksView() {
  const talks = useAtomValue(approvedTalksAtom);

  return (
    <main>
      <PageHeader title="라이트닝 토크" subtitle="발표를 신청하고 승인된 목록을 확인하세요" />
      <ApplyTalkForm />
      <Flex direction="column" gap="3" mt="4">
        {talks.map((talk) => (
          <Card key={talk.id} size="2" variant="surface">
            {talk.link ? (
              <Text asChild size="2">
                <a href={talk.link} target="_blank" rel="noopener noreferrer">
                  {talk.title}
                </a>
              </Text>
            ) : (
              <Text as="p" size="2">
                {talk.title}
              </Text>
            )}
          </Card>
        ))}
      </Flex>
    </main>
  );
}
