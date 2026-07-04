import { Avatar, Badge, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import type { Card as CardType } from "../model/types";

interface CardProfileProps {
  card: CardType;
}

export function CardProfile({ card }: CardProfileProps) {
  return (
    <Card size="3" variant="surface">
      <Flex direction="column" align="center" gap="3">
        <Avatar
          size="6"
          radius="full"
          fallback={card.nickname.slice(0, 2).toUpperCase()}
          color="blue"
        />
        <Flex direction="column" align="center" gap="2">
          <Heading as="h1" size="6" align="center">
            {card.nickname}
          </Heading>
          {card.role || card.company ? (
            <Badge color="blue" variant="soft">
              {card.role}
              {card.role && card.company ? " @ " : ""}
              {card.company}
            </Badge>
          ) : null}
        </Flex>
        {card.aiIntro ? (
          <Text as="p" size="2" color="gray" align="center">
            {card.aiIntro}
          </Text>
        ) : null}
        {card.service ? (
          <Text as="p" size="2" align="center">
            {card.service}
          </Text>
        ) : null}
        {card.github || card.linkedin ? (
          <Flex gap="2">
            {card.github ? (
              <Button variant="soft" asChild>
                <a href={card.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </Button>
            ) : null}
            {card.linkedin ? (
              <Button variant="soft" asChild>
                <a href={card.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </Button>
            ) : null}
          </Flex>
        ) : null}
      </Flex>
    </Card>
  );
}
