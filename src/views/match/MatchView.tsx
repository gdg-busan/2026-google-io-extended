"use client";

import { useAtomValue } from "jotai";
import { Flex, Heading, Text } from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";
import { cardByIdAtomFamily } from "@/entities/card";
import { GenerateIntroButton } from "@/features/generate-intro";
import { MatchPanel, myCardIdAtom } from "@/features/match";

/**
 * Builder Match + AI badge page (task #7). Both act on the current user's
 * own card, so the AI one-liner generator lives here alongside matching.
 */
export function MatchView() {
  const myCardId = useAtomValue(myCardIdAtom);
  const myCard = useAtomValue(
    cardByIdAtomFamily(myCardId ?? "__no_card__"),
  );

  return (
    <main>
      <PageHeader
        title="Builder Match"
        subtitle="AI 한 줄 소개를 만들고 나와 비슷한 Builder를 찾아보세요"
      />

      <Flex direction="column" gap="2" mb="5">
        <Heading as="h2" size="4">
          AI 한 줄 소개
        </Heading>
        {myCardId ? (
          <GenerateIntroButton
            cardId={myCardId}
            initialIntro={myCard?.aiIntro ?? null}
          />
        ) : (
          <Text as="p" size="2" color="gray">
            명함을 등록하면 AI 소개를 생성할 수 있어요.
          </Text>
        )}
      </Flex>

      <Flex direction="column" gap="2">
        <Heading as="h2" size="4">
          나와 비슷한 Builder
        </Heading>
        <MatchPanel />
      </Flex>
    </main>
  );
}
