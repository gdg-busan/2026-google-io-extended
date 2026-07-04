"use client";

import Link from "next/link";
import { useAtomValue } from "jotai";
import { cardsListAtom, CardListItem } from "@/entities/card";

export default function CardsPage() {
  const cards = useAtomValue(cardsListAtom);

  return (
    <main>
      <h1>참가자 명함</h1>
      <nav>
        <Link href="/cards/register">명함 등록</Link>
        {" · "}
        <Link href="/cards/recover">명함 복구</Link>
      </nav>
      {cards.length === 0 ? (
        <p>아직 등록된 명함이 없습니다.</p>
      ) : (
        <ul>
          {cards.map((card) => (
            <li key={card.id}>
              <CardListItem card={card} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
