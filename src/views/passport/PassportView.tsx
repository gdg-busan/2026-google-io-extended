"use client";

import { Card, Flex, Text } from "@radix-ui/themes";
import { PageHeader } from "@/shared/ui-kit";
import { MISSIONS } from "@/entities/mission";
import { PassportQr, PassportScanner, RaffleEntry } from "@/features/scan-passport";

/** Builder Passport page (task #7): missions, my QR, scanner, raffle entry. */
export function PassportView() {
  return (
    <main>
      <PageHeader
        title="Builder Passport"
        subtitle="네트워킹 미션을 완료하고 경품에 응모하세요"
      />

      <Flex direction="column" gap="2" mb="5">
        {MISSIONS.map((mission) => (
          <Card key={mission.id} size="2" variant="surface">
            <Text as="p" size="2">
              {mission.label}
            </Text>
          </Card>
        ))}
      </Flex>

      <Flex direction="column" gap="4">
        <PassportQr />
        <PassportScanner />
        <RaffleEntry />
      </Flex>
    </main>
  );
}
