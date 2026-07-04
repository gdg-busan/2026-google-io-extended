"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Flex, TabNav, Text } from "@radix-ui/themes";
import { EVENT_SHORT_NAME } from "@/shared/config";

const NAV_LINKS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/talks", label: "라이트닝 토크" },
  { href: "/admin/moderation", label: "모더레이션" },
  { href: "/admin/archive", label: "아카이브" },
] as const;

/** Top app bar + section nav for the /admin console (task #6, restyled task #14). */
export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <Box
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid var(--gray-a4)",
        background: "var(--color-panel-solid)",
      }}
    >
      <Flex align="center" justify="between" px="4" py="3">
        <Text weight="bold" size="2">
          {EVENT_SHORT_NAME} 관리자
        </Text>
        <Button type="button" variant="soft" color="gray" size="2" onClick={handleLogout}>
          로그아웃
        </Button>
      </Flex>
      <TabNav.Root>
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <TabNav.Link key={link.href} asChild active={isActive}>
              <Link href={link.href}>{link.label}</Link>
            </TabNav.Link>
          );
        })}
      </TabNav.Root>
    </Box>
  );
}
