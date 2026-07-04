"use client";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { Avatar, Button, Skeleton } from "@radix-ui/themes";
import { myCardAtom } from "@/entities/card";
import { isAuthReadyAtom } from "@/entities/session";

export function IdentityChip() {
  const ready = useAtomValue(isAuthReadyAtom);
  const card = useAtomValue(myCardAtom);
  if (!ready) return <Skeleton width="32px" height="32px" />;
  if (!card) {
    return (
      <Button asChild size="1" variant="soft">
        <Link href="/cards/register">명함 만들기</Link>
      </Button>
    );
  }
  return (
    <Link href="/cards" aria-label="내 명함">
      <Avatar
        size="2"
        radius="full"
        fallback={card.nickname.slice(0, 2).toUpperCase()}
        color="blue"
      />
    </Link>
  );
}
