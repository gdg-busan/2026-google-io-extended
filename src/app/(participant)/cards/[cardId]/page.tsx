"use client";

import { useParams } from "next/navigation";
import { useAtomValue } from "jotai";
import { Text } from "@radix-ui/themes";
import { cardByIdAtomFamily, CardProfile } from "@/entities/card";

export default function CardDetailPage() {
  const params = useParams<{ cardId: string }>();
  const card = useAtomValue(cardByIdAtomFamily(params.cardId));

  if (!card) {
    return <Text color="gray">명함을 찾을 수 없습니다.</Text>;
  }

  return <CardProfile card={card} />;
}
