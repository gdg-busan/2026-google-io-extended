"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface AdminTalkRow {
  id: string;
  title: string;
  link: string | null;
  status: "pending" | "approved";
  order: number | null;
}

type Props = { talks: AdminTalkRow[] };

/**
 * /admin/talks (task #6): approve/reject applications + reorder approved
 * talks. All mutations go through /api/admin/talks/[id] (Admin SDK writes
 * — the security rules deny client writes to status/order entirely).
 */
export function AdminTalksView({ talks }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const pending = talks.filter((talk) => talk.status === "pending");
  const approved = [...talks]
    .filter((talk) => talk.status === "approved")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleApprove = async (id: string) => {
    setPendingId(id);
    try {
      await fetch(`/api/admin/talks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", order: approved.length }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setPendingId(id);
    try {
      await fetch(`/api/admin/talks/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const handleOrderChange = async (id: string, order: number) => {
    setPendingId(id);
    try {
      await fetch(`/api/admin/talks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  return (
    <main>
      <h1>라이트닝 토크 관리</h1>
      <section>
        <h2>대기 중 ({pending.length})</h2>
        <ul>
          {pending.map((talk) => (
            <li key={talk.id}>
              <span>{talk.title}</span>
              {talk.link && (
                <a href={talk.link} target="_blank" rel="noopener noreferrer">
                  링크
                </a>
              )}
              <button
                type="button"
                disabled={pendingId === talk.id}
                onClick={() => handleApprove(talk.id)}
              >
                승인
              </button>
              <button
                type="button"
                disabled={pendingId === talk.id}
                onClick={() => handleReject(talk.id)}
              >
                거절
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>승인됨 ({approved.length})</h2>
        <ul>
          {approved.map((talk) => (
            <li key={talk.id}>
              <span>{talk.title}</span>
              <input
                type="number"
                min={0}
                defaultValue={talk.order ?? 0}
                disabled={pendingId === talk.id}
                onBlur={(event) =>
                  handleOrderChange(talk.id, Number(event.target.value))
                }
              />
              <button
                type="button"
                disabled={pendingId === talk.id}
                onClick={() => handleReject(talk.id)}
              >
                제거
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
