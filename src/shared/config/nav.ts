export type BrandColor = "blue" | "red" | "yellow" | "green";

export interface NavEntry {
  href: string;
  emoji: string;
  label: string;
  desc: string;
  color: BrandColor;
}

export interface NavGroup {
  id: string;
  title: string;
  entries: NavEntry[];
}

/** 홈 여정 그룹: 내 프로필 / 지금 참여하기 / 자료. */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "profile",
    title: "내 프로필",
    entries: [
      { href: "/cards", emoji: "🪪", label: "명함", desc: "닉네임·GitHub·프로필", color: "blue" },
      { href: "/match", emoji: "🤝", label: "Builder Match", desc: "AI 소개·비슷한 사람", color: "green" },
    ],
  },
  {
    id: "live",
    title: "지금 참여하기",
    entries: [
      { href: "/passport", emoji: "🎟️", label: "Passport", desc: "네트워킹 미션·경품", color: "red" },
      { href: "/bingo", emoji: "🎯", label: "I/O Bingo", desc: "키노트 빙고", color: "yellow" },
      { href: "/talks", emoji: "⚡", label: "라이트닝 토크", desc: "발표 신청", color: "blue" },
      { href: "/qna", emoji: "🙋", label: "Q&A", desc: "질문하고 좋아요", color: "green" },
      { href: "/keywords", emoji: "💬", label: "Word Cloud", desc: "키워드·관심사", color: "red" },
    ],
  },
  {
    id: "resources",
    title: "자료",
    entries: [
      { href: "/archive", emoji: "📦", label: "아카이브", desc: "발표자료·사진", color: "yellow" },
    ],
  },
];

/** BrandColor → 아이콘 칩 배경 CSS 변수. */
export const BRAND_TINT: Record<BrandColor, string> = {
  blue: "var(--brand-blue-tint)",
  red: "var(--brand-red-tint)",
  yellow: "var(--brand-yellow-tint)",
  green: "var(--brand-green-tint)",
};
