"use client";

import { useAtomValue } from "jotai";
import { cardByIdAtomFamily } from "@/entities/card";
import { GenerateIntroButton } from "@/features/generate-intro";
import { MatchPanel, myCardIdAtom } from "@/features/match";

/**
 * Builder Match + AI badge page (task #7). Both act on the current user's
 * own card, so the AI one-liner generator lives here alongside matching.
 */
export function MatchView() {
  const myCardId = useAtomValue(myCardIdAtom);
  const myCard = useAtomValue(
    cardByIdAtomFamily(myCardId ?? "__no_card__"),
  );

  return (
    <main>
      <h1>Builder Match</h1>

      <section>
        <h2>AI 한 줄 소개</h2>
        {myCardId ? (
          <GenerateIntroButton
            cardId={myCardId}
            initialIntro={myCard?.aiIntro ?? null}
          />
        ) : (
          <p>명함을 등록하면 AI 소개를 생성할 수 있어요.</p>
        )}
      </section>

      <section>
        <h2>나와 비슷한 Builder</h2>
        <MatchPanel />
      </section>
    </main>
  );
}
