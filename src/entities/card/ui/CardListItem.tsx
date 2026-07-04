import Link from "next/link";
import { Card, Flex, Text } from "@radix-ui/themes";
import type { Card as CardType } from "../model/types";

interface CardListItemProps {
  card: CardType;
}

export function CardListItem({ card }: CardListItemProps) {
  return (
    <Card asChild size="2" variant="surface">
      <Link href={`/cards/${card.id}`}>
        <Flex direction="column" gap="1">
          <Text as="div" weight="bold" size="3">
            {card.nickname}
          </Text>
          {card.role && card.company ? (
            <Text as="div" size="1" color="gray">
              {card.role} @ {card.company}
            </Text>
          ) : null}
        </Flex>
      </Link>
    </Card>
  );
}
