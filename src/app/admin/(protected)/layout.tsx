import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Box, Container } from "@radix-ui/themes";
import { AdminNav } from "@/widgets/admin-panel";
import { requireAdminSession } from "@/shared/lib/admin-auth";

/**
 * Force dynamic rendering for every /admin/* page under this group. Without
 * this, our try/catch around requireAdminSession() (which calls cookies())
 * swallows Next's internal "bail out to dynamic rendering" signal, so the
 * build attempts to statically prerender these pages — which then fail
 * trying to reach real Firestore via the Admin SDK at build time.
 */
export const dynamic = "force-dynamic";

/**
 * Guards every /admin/* page except /admin/login (task #6). This is a
 * UX convenience — the real security boundary is each /api/admin/*
 * Route Handler independently verifying the same cookie server-side.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireAdminSession();
  } catch {
    redirect("/admin/login");
  }

  return (
    <Box>
      <AdminNav />
      <Container size="3" px="4" py="5" asChild>
        <main>{children}</main>
      </Container>
    </Box>
  );
}
