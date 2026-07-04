"use client";
import { useAtomValue } from "jotai";
import { Container, Flex, Heading, Text } from "@radix-ui/themes";
import { EVENT_NAME, NAV_GROUPS } from "@/shared/config";
import { Section, FeatureCard } from "@/shared/ui-kit";
import { hasRegisteredCardAtom, myCardAtom } from "@/entities/card";

export default function Home() {
  const hasCard = useAtomValue(hasRegisteredCardAtom);
  const card = useAtomValue(myCardAtom);

  return (
    <Container size="1" px="4" py="6">
      <Flex direction="column" align="center" gap="1" mb="6">
        <Text size="1" weight="bold" color="blue" style={{ letterSpacing: "0.08em" }}>
          BUILDER BOARD
        </Text>
        <Heading as="h1" size="7" align="center">
          {EVENT_NAME}
        </Heading>
        <Text size="2" color="gray" align="center">
          {hasCard && card ? `환영해요, ${card.nickname}님` : "로그인 없이 바로 참여하세요"}
        </Text>
      </Flex>

      {NAV_GROUPS.map((group) => (
        <Section key={group.id} title={group.title}>
          {group.entries.map((entry) => (
            <FeatureCard
              key={entry.href}
              entry={entry}
              variant={!hasCard && entry.href === "/cards" ? "cta" : "default"}
            />
          ))}
        </Section>
      ))}
    </Container>
  );
}
