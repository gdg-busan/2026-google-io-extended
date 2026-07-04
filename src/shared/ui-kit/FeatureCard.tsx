import Link from "next/link";
import { Card, Flex, Text } from "@radix-ui/themes";
import { BRAND_TINT, type NavEntry } from "@/shared/config";

interface FeatureCardProps {
  entry: NavEntry;
  variant?: "default" | "cta";
}

export function FeatureCard({ entry, variant = "default" }: FeatureCardProps) {
  const isCta = variant === "cta";
  return (
    <Card asChild size="2" variant={isCta ? "classic" : "surface"}>
      <Link href={entry.href}>
        <Flex align="center" gap="3">
          <Flex
            align="center"
            justify="center"
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-3)",
              background: BRAND_TINT[entry.color],
              fontSize: 22,
              flexShrink: 0,
            }}
            aria-hidden
          >
            {entry.emoji}
          </Flex>
          <Flex direction="column" gap="1">
            <Text as="div" weight="bold" size="3">
              {entry.label}
            </Text>
            <Text as="div" size="1" color="gray">
              {isCta ? "여기서 시작하세요 →" : entry.desc}
            </Text>
          </Flex>
        </Flex>
      </Link>
    </Card>
  );
}
