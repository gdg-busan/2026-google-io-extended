"use client";

import { useAtomValue } from "jotai";
import { useState } from "react";
import { Badge, Button, Callout, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
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
      <Callout.Root color="grass">
        <Callout.Text>
          <Text as="p" weight="bold">
            경품 응모 완료 🎟️
          </Text>
          응모가 접수됐어요. 추첨 결과를 기다려 주세요!
        </Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <Card size="2" variant="surface">
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between" gap="3">
          <Heading as="h2" size="3">
            경품 응모
          </Heading>
          <Badge color={unlocked ? "grass" : "gray"} variant="soft" size="2">
            {connections} / {RAFFLE_CONNECTION_THRESHOLD}명 연결됨
          </Badge>
        </Flex>
        {!unlocked && (
          <Text size="2" color="gray">
            {RAFFLE_CONNECTION_THRESHOLD}명과 연결하면 응모할 수 있어요.
          </Text>
        )}
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
            <Flex direction="column" gap="2">
              <Text as="label" size="2">
                연락처 (이메일 또는 전화번호)
                <TextField.Root
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="추첨 안내를 받을 연락처"
                  required
                  mt="1"
                />
              </Text>
              <Button type="submit" disabled={isSubmitting || !contact.trim()}>
                {isSubmitting ? "응모 중…" : "응모하기"}
              </Button>
              {error && (
                <Callout.Root color="red" role="alert">
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              )}
            </Flex>
          </form>
        )}
      </Flex>
    </Card>
  );
}
