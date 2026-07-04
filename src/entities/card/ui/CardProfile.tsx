import type { Card } from "../model/types";

interface CardProfileProps {
  card: Card;
}

export function CardProfile({ card }: CardProfileProps) {
  return (
    <article>
      <h1>{card.nickname}</h1>
      {card.role || card.company ? (
        <p>
          {card.role}
          {card.role && card.company ? " @ " : ""}
          {card.company}
        </p>
      ) : null}
      {card.aiIntro ? <p>{card.aiIntro}</p> : null}
      <ul>
        {card.service ? <li>{card.service}</li> : null}
        {card.github ? (
          <li>
            <a href={card.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
        ) : null}
        {card.linkedin ? (
          <li>
            <a href={card.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
        ) : null}
      </ul>
    </article>
  );
}
