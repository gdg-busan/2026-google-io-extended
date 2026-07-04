"use client";

import Link from "next/link";
import { useAtomValue } from "jotai";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Button, Callout, Flex, Grid } from "@radix-ui/themes";
import { cardsListAtom, CardListItem } from "@/entities/card";
import { PageHeader } from "@/shared/ui-kit";

export default function CardsPage() {
  const cards = useAtomValue(cardsListAtom);

  return (
    <>
      <PageHeader
        title="참가자 명함"
        action={
          <Flex gap="2">
            <Button variant="ghost" asChild>
              <Link href="/cards/recover">명함 복구</Link>
            </Button>
            <Button asChild>
              <Link href="/cards/register">명함 등록</Link>
            </Button>
          </Flex>
        }
      />
      {cards.length === 0 ? (
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>아직 등록된 명함이 없습니다.</Callout.Text>
        </Callout.Root>
      ) : (
        <Grid columns={{ initial: "1", xs: "2" }} gap="3">
          {cards.map((card) => (
            <CardListItem key={card.id} card={card} />
          ))}
        </Grid>
      )}
    </>
  );
}
