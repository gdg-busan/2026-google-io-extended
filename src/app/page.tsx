import Link from "next/link";
import { EVENT_NAME } from "@/shared/config";
import styles from "./page.module.css";

const ENTRIES = [
  { href: "/cards", emoji: "🪪", label: "명함 등록", desc: "닉네임·GitHub·만드는 것" },
  { href: "/keywords", emoji: "💬", label: "Word Cloud", desc: "키워드·네트워킹 관심사" },
  { href: "/qna", emoji: "🙋", label: "Q&A", desc: "질문하고 좋아요" },
  { href: "/talks", emoji: "⚡", label: "라이트닝 토크", desc: "발표 신청" },
  { href: "/passport", emoji: "🎟️", label: "Passport", desc: "네트워킹 미션·경품" },
  { href: "/match", emoji: "🤝", label: "Builder Match", desc: "AI 소개·비슷한 사람" },
  { href: "/bingo", emoji: "🎯", label: "I/O Bingo", desc: "키노트 빙고" },
  { href: "/archive", emoji: "📦", label: "아카이브", desc: "발표자료·사진" },
];

/** QR-landing hub (task #8): first participant action reachable in one tap. */
export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.kicker}>Builder Board</p>
        <h1 className={styles.title}>{EVENT_NAME}</h1>
        <p className={styles.subtitle}>로그인 없이 바로 참여하세요</p>
      </header>
      <nav className={styles.grid}>
        {ENTRIES.map((entry) => (
          <Link key={entry.href} href={entry.href} className={styles.card}>
            <span className={styles.emoji} aria-hidden>
              {entry.emoji}
            </span>
            <span className={styles.label}>{entry.label}</span>
            <span className={styles.desc}>{entry.desc}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
