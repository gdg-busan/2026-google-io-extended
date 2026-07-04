"use client";

import { useAtomValue } from "jotai";
import { useState } from "react";
import { useSession } from "@/entities/session";
import { connectionCountAtom } from "@/entities/scan-edge";
import { RAFFLE_CONNECTION_THRESHOLD } from "@/entities/mission";
import { enterRaffle } from "../model/enter-raffle";
import { myRaffleEntryAtom } from "../model/atoms";

/**
 * Raffle entry (task #7): unlocks once the builder has connected with
 * RAFFLE_CONNECTION_THRESHOLD distinct people. Contact info is collected
 * only here, at entry time.
 */
export function RaffleEntry() {
  const { uid } = useSession();
  const connections = useAtomValue(connectionCountAtom);
  const entry = useAtomValue(myRaffleEntryAtom);
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlocked = connections >= RAFFLE_CONNECTION_THRESHOLD;

  if (entry) {
    return (
      <section>
        <h2>경품 응모 완료 🎟️</h2>
        <p>응모가 접수됐어요. 추첨 결과를 기다려 주세요!</p>
      </section>
    );
  }

  return (
    <section>
      <h2>경품 응모</h2>
      <p>
        {connections} / {RAFFLE_CONNECTION_THRESHOLD}명 연결됨
        {!unlocked && ` — ${RAFFLE_CONNECTION_THRESHOLD}명과 연결하면 응모할 수 있어요.`}
      </p>
      {unlocked && (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!uid) return;
            setIsSubmitting(true);
            setError(null);
            try {
              await enterRaffle(uid, contact);
            } catch (submitError) {
              setError(
                submitError instanceof Error
                  ? submitError.message
                  : "응모에 실패했어요.",
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label>
            연락처 (이메일 또는 전화번호)
            <input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="추첨 안내를 받을 연락처"
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting || !contact.trim()}>
            {isSubmitting ? "응모 중…" : "응모하기"}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </section>
  );
}
