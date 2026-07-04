"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** /admin/login screen (task #6): passcode form -> POST /api/admin/login. */
export function AdminLoginView() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "로그인에 실패했어요.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h1>운영 콘솔 로그인</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="admin-passcode">Passcode</label>
        <input
          id="admin-passcode"
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <button type="submit" disabled={isSubmitting || !passcode}>
          {isSubmitting ? "확인 중..." : "로그인"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
