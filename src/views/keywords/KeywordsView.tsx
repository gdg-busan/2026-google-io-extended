"use client";

import { useAtomValue } from "jotai";
import { Badge, Flex, Heading, Text } from "@radix-ui/themes";
import { networkingKeywordsAtom, wordcloudKeywordsAtom } from "@/entities/keyword";
import { NetworkingKeywordPicker, WordCloudSubmitForm } from "@/features/submit-keyword";
import { PageHeader } from "@/shared/ui-kit";

export function KeywordsView() {
  const wordcloudKeywords = useAtomValue(wordcloudKeywordsAtom);
  const networkingKeywords = useAtomValue(networkingKeywordsAtom);

  return (
    <Flex direction="column" gap="6">
      <PageHeader
        title="키워드"
        subtitle="Word Cloud와 네트워킹에 쓸 키워드를 등록하세요"
      />

      <Flex direction="column" gap="3" asChild>
        <section>
          <Heading as="h2" size="4">
            Word Cloud 키워드
          </Heading>
          <WordCloudSubmitForm />
          <Text size="2" color="gray">
            {wordcloudKeywords.length}개 제출됨
          </Text>
        </section>
      </Flex>

      <Flex direction="column" gap="3" asChild>
        <section>
          <Heading as="h2" size="4">
            네트워킹 키워드
          </Heading>
          <NetworkingKeywordPicker />
          <Flex wrap="wrap" gap="2">
            {networkingKeywords.map((keyword) => (
              <Badge key={keyword.id} size="2" color="blue" variant="soft">
                {keyword.text}
              </Badge>
            ))}
          </Flex>
        </section>
      </Flex>
    </Flex>
  );
}
