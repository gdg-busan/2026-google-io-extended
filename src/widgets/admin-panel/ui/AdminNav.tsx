"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/** Top nav for the /admin console (task #6). */
export function AdminNav() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <nav>
      <Link href="/admin">대시보드</Link>
      <Link href="/admin/talks">라이트닝 토크</Link>
      <Link href="/admin/moderation">모더레이션</Link>
      <Link href="/admin/archive">아카이브</Link>
      <button type="button" onClick={handleLogout}>
        로그아웃
      </button>
    </nav>
  );
}
