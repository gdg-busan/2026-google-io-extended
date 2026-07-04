import Link from "next/link";
import type { Card } from "../model/types";

interface CardListItemProps {
  card: Card;
}

export function CardListItem({ card }: CardListItemProps) {
  return (
    <Link href={`/cards/${card.id}`}>
      <strong>{card.nickname}</strong>
      {card.role && card.company ? (
        <span>
          {" "}
          — {card.role} @ {card.company}
        </span>
      ) : null}
    </Link>
  );
}
