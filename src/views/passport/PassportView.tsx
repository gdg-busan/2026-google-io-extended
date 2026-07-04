"use client";

import { MISSIONS } from "@/entities/mission";
import { PassportQr, PassportScanner, RaffleEntry } from "@/features/scan-passport";

/** Builder Passport page (task #7): missions, my QR, scanner, raffle entry. */
export function PassportView() {
  return (
    <main>
      <h1>Builder Passport</h1>

      <section>
        <h2>네트워킹 미션</h2>
        <ul>
          {MISSIONS.map((mission) => (
            <li key={mission.id}>{mission.label}</li>
          ))}
        </ul>
      </section>

      <PassportQr />
      <PassportScanner />
      <RaffleEntry />
    </main>
  );
}
