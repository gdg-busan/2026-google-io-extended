"use client";

import { useAtomValue } from "jotai";
import { Button, Card, Flex, Grid, Heading, Inset, Text } from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";
import { archiveItemsAtom, type ArchiveType } from "@/entities/archive";

const SECTIONS: { type: ArchiveType; title: string; emoji: string; actionLabel: string }[] = [
  { type: "slide", title: "발표 자료", emoji: "📄", actionLabel: "다운로드" },
  { type: "photo", title: "행사 사진", emoji: "🖼️", actionLabel: "보기" },
  { type: "discord", title: "커뮤니티", emoji: "💬", actionLabel: "참여하기" },
];

/**
 * Post-event archive (task #8): slides, photos, and Discord invite —
 * everything stays reachable on the same site after the event ends.
 */
export function ArchiveView() {
  const items = useAtomValue(archiveItemsAtom);

  return (
    <Flex direction="column">
      <PageHeader title="행사 아카이브" />

      {items.length === 0 && (
        <Text as="p" size="2" color="gray">
          행사 후 자료가 이곳에 올라와요.
        </Text>
      )}

      {SECTIONS.map((section) => {
        const sectionItems = items.filter((item) => item.type === section.type);
        if (sectionItems.length === 0) return null;
        return (
          <Flex key={section.type} direction="column" gap="3" mb="6" asChild>
            <section>
              <Heading as="h2" size="4">
                {section.title}
              </Heading>
              <Grid columns={{ initial: "2", xs: "3" }} gap="3">
                {sectionItems.map((item) => (
                  <Card key={item.id} size="2" variant="surface">
                    <Inset side="top" pb="current">
                      <Flex
                        align="center"
                        justify="center"
                        style={{ height: 96, background: "var(--gray-a3)", fontSize: 32 }}
                        aria-hidden
                      >
                        {section.emoji}
                      </Flex>
                    </Inset>
                    <Flex direction="column" gap="2">
                      <Text as="div" weight="bold" size="2">
                        {item.title}
                      </Text>
                      <Button size="1" variant="soft" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {section.actionLabel}
                        </a>
                      </Button>
                    </Flex>
                  </Card>
                ))}
              </Grid>
            </section>
          </Flex>
        );
      })}
    </Flex>
  );
}
