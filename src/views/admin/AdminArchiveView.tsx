"use client";

import { useAtomValue } from "jotai";
import { useState } from "react";
import { archiveItemsAtom, type ArchiveType } from "@/entities/archive";

const TYPE_OPTIONS: { value: ArchiveType; label: string }[] = [
  { value: "slide", label: "발표 자료" },
  { value: "photo", label: "행사 사진" },
  { value: "discord", label: "커뮤니티" },
];

/**
 * Admin archive manager (task #8): add a titled URL record (slides/photos/
 * Discord) or delete one. Same-origin admin API calls carry the session
 * cookie automatically; the handlers verify it server-side.
 */
export function AdminArchiveView() {
  const items = useAtomValue(archiveItemsAtom);
  const [type, setType] = useState<ArchiveType>("slide");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, url }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "추가에 실패했어요.");
        return;
      }
      setTitle("");
      setUrl("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/archive/${id}`, { method: "DELETE" });
  };

  return (
    <main>
      <h1>아카이브 관리</h1>
      <form onSubmit={handleSubmit}>
        <select value={type} onChange={(event) => setType(event.target.value as ArchiveType)}>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목"
          required
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
          type="url"
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "추가 중…" : "추가"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>
              [{item.type}] {item.title}
            </span>
            <button type="button" onClick={() => handleDelete(item.id)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
