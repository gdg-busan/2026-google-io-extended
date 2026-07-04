"use client";

import { useParams } from "next/navigation";
import { useAtomValue } from "jotai";
import { cardByIdAtomFamily, CardProfile } from "@/entities/card";

export default function CardDetailPage() {
  const params = useParams<{ cardId: string }>();
  const card = useAtomValue(cardByIdAtomFamily(params.cardId));

  if (!card) {
    return <p>명함을 찾을 수 없습니다.</p>;
  }

  return (
    <main>
      <CardProfile card={card} />
    </main>
  );
}
