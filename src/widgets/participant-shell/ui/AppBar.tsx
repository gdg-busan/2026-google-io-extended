import Link from "next/link";
import { Flex, Text } from "@radix-ui/themes";
import { IdentityChip } from "./IdentityChip";

export function AppBar() {
  return (
    <Flex
      asChild
      align="center"
      justify="between"
      px="4"
      py="3"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid var(--gray-a4)",
        background: "var(--color-panel-solid)",
      }}
    >
      <header>
        <Link href="/">
          <Text weight="bold" size="2">
            Builder Board
          </Text>
        </Link>
        <IdentityChip />
      </header>
    </Flex>
  );
}
