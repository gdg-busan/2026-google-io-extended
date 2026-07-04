# Radix 기반 프론트엔드 재설계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Builder Board 프론트 전체(참가자·관리자·프로젝터)를 Radix Themes 기반 GDG 브랜드 디자인 시스템으로 재설계하고, 홈을 여정 단계별 그룹으로 재구성한다.

**Architecture:** 루트에 `<Theme>`(라이트) 도입, `/screen` 서브트리만 로컬 `<Theme appearance="dark">`. 공유 UI 키트(`shared/ui-kit`)와 참가자/관리자 공통 셸 레이아웃을 신설. 기존 `views/`·`features/*/ui/`의 프레젠테이션만 Radix 컴포넌트로 교체하고 model/api/atoms는 불변으로 둔다 (FSD + eslint-boundaries 준수).

**Tech Stack:** Next.js 16 (App Router) · React 19 · `@radix-ui/themes@3.3.0` · `@radix-ui/react-icons@1.3.2` · Jotai · Firebase · TypeScript · Vitest.

## Global Constraints

- `@radix-ui/themes` 버전: **3.3.0** (React 19 peer 지원 확인). 아이콘은 `@radix-ui/react-icons@1.3.2`.
- 패키지 매니저: **pnpm** (`pnpm add`, `pnpm dlx` 사용, npm/yarn 금지).
- Radix `<Theme>` 루트 설정: `appearance="light" accentColor="blue" grayColor="slate" radius="large" scaling="100%"`.
- GDG 브랜드 4색(카테고리/배지/아이콘 칩 틴트 전용, 인터랙션은 Radix `blue` accent): `--brand-blue #4285F4`, `--brand-red #EA4335`, `--brand-yellow #F9AB00`, `--brand-green #34A853`.
- `TextField`는 **`TextField.Root` + `TextField.Slot`** API (`TextField.Input` 아님).
- Next `<Link>`를 Radix 요소로 렌더할 땐 **`asChild`** 패턴.
- 로직·Firestore 스키마·Gemini·atoms **불변** — UI 표현 레이어만 교체.
- 다크/시스템 모드 토글은 비목표(참가자·관리자 라이트 고정). `/screen`만 다크.
- 각 태스크 종료 시 `pnpm build` 그린 + `pnpm lint`(eslint-boundaries 포함) 통과. 시각 태스크는 Playwright 스크린샷으로 확인.
- 커밋 타입: `feat/fix/refactor/docs/chore`. 브랜치: `feat/radix-frontend-redesign` (이미 체크아웃됨).

---

## Phase 1 — 기반/토큰

### Task 1: Radix Themes 설치 + 루트 Theme 도입

**Files:**
- Modify: `package.json` (의존성 추가 — pnpm이 기록)
- Modify: `src/app/layout.tsx`
- Create: `src/app/theme.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: 전역 `<Theme appearance="light" accentColor="blue" grayColor="slate" radius="large" scaling="100%">` 래핑, 브랜드 CSS 변수(`--brand-blue|red|yellow|green`).

- [ ] **Step 1: 의존성 설치**

Run: `pnpm add @radix-ui/themes@3.3.0 @radix-ui/react-icons@1.3.2`
Expected: `package.json` dependencies에 두 패키지 추가, `pnpm-lock.yaml` 갱신.

- [ ] **Step 2: `src/app/theme.css` 생성 (브랜드 토큰)**

```css
/* GDG / Google I/O 브랜드 토큰. Radix `blue` accent 위에 얹는 카테고리 색. */
:root {
  --brand-blue: #4285f4;
  --brand-red: #ea4335;
  --brand-yellow: #f9ab00; /* 흰 배경 텍스트 대비용 진한 톤 */
  --brand-green: #34a853;

  /* 아이콘 칩 배경 틴트 (12% 불투명) */
  --brand-blue-tint: color-mix(in oklch, var(--brand-blue) 12%, transparent);
  --brand-red-tint: color-mix(in oklch, var(--brand-red) 12%, transparent);
  --brand-yellow-tint: color-mix(in oklch, var(--brand-yellow) 16%, transparent);
  --brand-green-tint: color-mix(in oklch, var(--brand-green) 12%, transparent);
}
```

- [ ] **Step 3: `src/app/globals.css`에서 자동 다크모드 블록 제거**

`@media (prefers-color-scheme: dark)`로 `--background/--foreground`를 덮는 블록과 `color-scheme: dark` 블록을 삭제한다. CSS 리셋(`* { box-sizing; margin:0; padding:0 }`, `html/body { max-width:100vw; overflow-x:hidden }`, `a { color: inherit }`, 폰트 스무딩)과 `--background/--foreground` 라이트 기본값은 유지. `body`의 `font-family`는 Radix가 관리하므로 그대로 두되 배경은 Radix Theme가 덮는다.

- [ ] **Step 4: `src/app/layout.tsx` 수정 — styles + Theme 래핑**

기존 import 블록 최상단에 추가하고, `<body>` 자식을 `<Theme>`로 감싼다 (기존 `JotaiProvider`, `SessionBootstrap`는 Theme **안쪽**에 유지):

```tsx
import "@radix-ui/themes/styles.css";
import "./theme.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
// ...기존 imports (fonts, JotaiProvider, SessionBootstrap, EVENT_NAME 등)

// RootLayout body 내부:
// <body className={`${geistSans.variable} ${geistMono.variable}`}>
//   <Theme appearance="light" accentColor="blue" grayColor="slate" radius="large" scaling="100%">
//     <JotaiProvider>
//       <SessionBootstrap />
//       {children}
//     </JotaiProvider>
//   </Theme>
// </body>
```

`import` 순서 주의: `@radix-ui/themes/styles.css`를 `theme.css`/`globals.css`보다 **먼저** import해야 브랜드 오버라이드가 Radix 기본값을 이긴다.

- [ ] **Step 5: 빌드 검증**

Run: `pnpm build`
Expected: 성공. 타입/컴파일 에러 없음.

- [ ] **Step 6: 커밋**

```bash
git add package.json pnpm-lock.yaml src/app/layout.tsx src/app/theme.css src/app/globals.css
git commit -m "feat: introduce Radix Themes + GDG brand tokens at root"
```

---

### Task 2: 카테고리/내비 설정 + 공유 UI 키트

**Files:**
- Create: `src/shared/config/nav.ts`
- Modify: `src/shared/config/index.ts` (barrel export)
- Create: `src/shared/ui-kit/PageHeader.tsx`
- Create: `src/shared/ui-kit/Section.tsx`
- Create: `src/shared/ui-kit/FeatureCard.tsx`
- Create: `src/shared/ui-kit/index.ts`

**Interfaces:**
- Produces:
  - `type BrandColor = "blue" | "red" | "yellow" | "green"`
  - `interface NavEntry { href: string; emoji: string; label: string; desc: string; color: BrandColor }`
  - `const NAV_GROUPS: { id: string; title: string; entries: NavEntry[] }[]`
  - `<PageHeader title: string subtitle?: string action?: ReactNode />`
  - `<Section title: string children: ReactNode />`
  - `<FeatureCard entry: NavEntry variant?: "default" | "cta" />`

- [ ] **Step 1: `src/shared/config/nav.ts` 생성 (여정 그룹 데이터)**

```tsx
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
```

- [ ] **Step 2: `src/shared/config/index.ts`에 barrel export 추가**

기존 export 아래에 추가: `export * from "./nav";`

- [ ] **Step 3: `src/shared/ui-kit/Section.tsx` 생성**

```tsx
import type { ReactNode } from "react";
import { Box, Grid, Heading } from "@radix-ui/themes";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <Box mb="6" asChild>
      <section>
        <Heading as="h2" size="3" mb="3" color="gray" highContrast>
          {title}
        </Heading>
        <Grid columns={{ initial: "1", xs: "2" }} gap="3">
          {children}
        </Grid>
      </section>
    </Box>
  );
}
```

- [ ] **Step 4: `src/shared/ui-kit/FeatureCard.tsx` 생성**

```tsx
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
```

- [ ] **Step 5: `src/shared/ui-kit/PageHeader.tsx` 생성**

```tsx
import type { ReactNode } from "react";
import { Flex, Heading, Text } from "@radix-ui/themes";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Flex justify="between" align="start" mb="4" gap="3">
      <Flex direction="column" gap="1">
        <Heading as="h1" size="6">
          {title}
        </Heading>
        {subtitle ? (
          <Text size="2" color="gray">
            {subtitle}
          </Text>
        ) : null}
      </Flex>
      {action ? <Flex flexShrink="0">{action}</Flex> : null}
    </Flex>
  );
}
```

- [ ] **Step 6: `src/shared/ui-kit/index.ts` barrel 생성**

```tsx
export { PageHeader } from "./PageHeader";
export { Section } from "./Section";
export { FeatureCard } from "./FeatureCard";
```

- [ ] **Step 7: 빌드 + 린트 검증**

Run: `pnpm build && pnpm lint`
Expected: 성공. eslint-boundaries 위반 없음 (ui-kit은 shared 레이어, config import 허용).

- [ ] **Step 8: 커밋**

```bash
git add src/shared/config src/shared/ui-kit
git commit -m "feat: add nav config and Radix-based shared ui-kit (PageHeader, Section, FeatureCard)"
```

---

## Phase 2 — 참가자 공통 셸 + 홈

### Task 3: "내 명함" 파생 아톰

**Files:**
- Create: `src/entities/card/model/my-card.ts`
- Modify: `src/entities/card/index.ts` (barrel export)
- Test: `src/entities/card/model/my-card.test.ts`

**Interfaces:**
- Consumes: `uidAtom` (`@/entities/session`), `Card` 타입, Firestore `cards` 컬렉션.
- Produces:
  - `myCardAtom` — `Atom<Card | null>` (현재 uid의 `ownerUid` 카드, 없으면 null)
  - `hasRegisteredCardAtom` — `Atom<boolean>`

- [ ] **Step 1: 실패 테스트 작성 — `my-card.test.ts`**

```tsx
import { describe, it, expect } from "vitest";
import { createStore } from "jotai";
import { uidAtom } from "@/entities/session";
import { hasRegisteredCardAtom } from "./my-card";

describe("hasRegisteredCardAtom", () => {
  it("uid가 없으면 false", () => {
    const store = createStore();
    store.set(uidAtom, null);
    expect(store.get(hasRegisteredCardAtom)).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm vitest run src/entities/card/model/my-card.test.ts`
Expected: FAIL — `hasRegisteredCardAtom` 미정의.

- [ ] **Step 3: `my-card.ts` 구현**

```tsx
import { collection, orderBy, query, where } from "firebase/firestore";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { of } from "rxjs"; // 없으면 아래 대체 구현 사용
import { db } from "@/shared/firebase";
import { collectionObservable } from "@/shared/lib";
import { uidAtom } from "@/entities/session";
import { cardConverter } from "../api/converter";
import type { Card } from "./types";

const cardsCollection = collection(db, "cards").withConverter(cardConverter);

/** 현재 uid가 소유한 카드(첫 항목) 또는 null. uid가 없으면 항상 null. */
export const myCardAtom = atomWithObservable<Card | null>((get) => {
  const uid = get(uidAtom);
  if (!uid) return collectionObservableEmpty();
  return mapFirst(
    collectionObservable(
      query(cardsCollection, where("ownerUid", "==", uid), orderBy("createdAt", "desc")),
    ),
  );
}, { initialValue: null });

export const hasRegisteredCardAtom = atom((get) => get(myCardAtom) !== null);
```

주의: `atomWithObservable` 콜백은 rxjs `Observable`을 반환해야 한다. `collectionObservable`이 `Observable<Card[]>`를 준다고 가정하고, `mapFirst`/`collectionObservableEmpty` 헬퍼는 `src/shared/lib`의 실제 시그니처에 맞춰 구현한다. `src/shared/lib`의 `firestore-observable` 구현을 먼저 읽고(`collectionObservable`이 rxjs인지 커스텀인지 확인), rxjs면 `import { map } from "rxjs"; const mapFirst = (o) => o.pipe(map((cards: Card[]) => cards[0] ?? null))`, 빈값은 `of(null)`. 커스텀 옵저버블이면 동일 시맨틱의 래퍼를 작성한다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm vitest run src/entities/card/model/my-card.test.ts`
Expected: PASS.

- [ ] **Step 5: barrel export + 빌드**

`src/entities/card/index.ts`에 `export { myCardAtom, hasRegisteredCardAtom } from "./model/my-card";` 추가.
Run: `pnpm build`
Expected: 성공.

- [ ] **Step 6: 커밋**

```bash
git add src/entities/card
git commit -m "feat: derive myCardAtom / hasRegisteredCardAtom from uid + ownerUid"
```

---

### Task 4: 참가자 공통 셸 레이아웃 + 신원 칩

**Files:**
- Create: `src/app/(participant)/layout.tsx`
- Create: `src/widgets/participant-shell/ui/AppBar.tsx`
- Create: `src/widgets/participant-shell/ui/IdentityChip.tsx`
- Create: `src/widgets/participant-shell/index.ts`

**Interfaces:**
- Consumes: `myCardAtom`, `isAuthReadyAtom`, `EVENT_SHORT_NAME`.
- Produces: `(participant)` 라우트 전체를 감싸는 `<AppBar>` + `<Container>` 셸.

- [ ] **Step 1: `IdentityChip.tsx` 생성**

```tsx
"use client";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { Avatar, Button, Skeleton } from "@radix-ui/themes";
import { myCardAtom } from "@/entities/card";
import { isAuthReadyAtom } from "@/entities/session";

export function IdentityChip() {
  const ready = useAtomValue(isAuthReadyAtom);
  const card = useAtomValue(myCardAtom);
  if (!ready) return <Skeleton width="32px" height="32px" />;
  if (!card) {
    return (
      <Button asChild size="1" variant="soft">
        <Link href="/cards/register">명함 만들기</Link>
      </Button>
    );
  }
  return (
    <Link href="/cards" aria-label="내 명함">
      <Avatar
        size="2"
        radius="full"
        fallback={card.nickname.slice(0, 2).toUpperCase()}
        color="blue"
      />
    </Link>
  );
}
```

- [ ] **Step 2: `AppBar.tsx` 생성**

```tsx
import Link from "next/link";
import { Flex, Text } from "@radix-ui/themes";
import { EVENT_SHORT_NAME } from "@/shared/config";
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
```

- [ ] **Step 3: barrel export**

`src/widgets/participant-shell/index.ts`: `export { AppBar } from "./ui/AppBar";`

- [ ] **Step 4: `(participant)/layout.tsx` 생성**

```tsx
import type { ReactNode } from "react";
import { Container, Box } from "@radix-ui/themes";
import { AppBar } from "@/widgets/participant-shell";

export default function ParticipantLayout({ children }: { children: ReactNode }) {
  return (
    <Box>
      <AppBar />
      <Container size="1" px="4" py="5">
        {children}
      </Container>
    </Box>
  );
}
```

- [ ] **Step 5: 빌드 + 린트**

Run: `pnpm build && pnpm lint`
Expected: 성공. (widget → entities/shared import 허용.)

- [ ] **Step 6: 스크린샷 검증**

`pnpm dev` 실행 후 Playwright로 `/cards`(참가자 라우트, 셸 적용됨) 방문, 320·768폭 스크린샷. 앱바가 sticky로 뜨고 신원 칩(미등록 시 "명함 만들기")이 보이는지 확인.

- [ ] **Step 7: 커밋**

```bash
git add "src/app/(participant)/layout.tsx" src/widgets/participant-shell
git commit -m "feat: add participant shell layout with sticky AppBar + identity chip"
```

---

### Task 5: 홈 여정 그룹 재설계

**Files:**
- Modify: `src/app/page.tsx` (전면 재작성)
- Delete: `src/app/page.module.css` (Radix로 대체, 남은 참조 없을 때)

**Interfaces:**
- Consumes: `NAV_GROUPS`, `Section`, `FeatureCard`, `hasRegisteredCardAtom`, `myCardAtom`, `EVENT_NAME`.

- [ ] **Step 1: `src/app/page.tsx` 재작성**

홈은 참가자 셸 밖(루트 `app/page.tsx`)이므로 자체 `<Container>`를 쓴다. "내 프로필" 그룹의 명함 엔트리는 미등록 시 `variant="cta"`.

```tsx
"use client";
import { useAtomValue } from "jotai";
import { Container, Flex, Heading, Text } from "@radix-ui/themes";
import { EVENT_NAME } from "@/shared/config";
import { NAV_GROUPS } from "@/shared/config";
import { Section, FeatureCard } from "@/shared/ui-kit";
import { hasRegisteredCardAtom, myCardAtom } from "@/entities/card";

export default function Home() {
  const hasCard = useAtomValue(hasRegisteredCardAtom);
  const card = useAtomValue(myCardAtom);

  return (
    <Container size="1" px="4" py="6">
      <Flex direction="column" align="center" gap="1" mb="6">
        <Text size="1" weight="bold" color="blue" style={{ letterSpacing: "0.08em" }}>
          BUILDER BOARD
        </Text>
        <Heading as="h1" size="7" align="center">
          {EVENT_NAME}
        </Heading>
        <Text size="2" color="gray" align="center">
          {hasCard && card ? `환영해요, ${card.nickname}님` : "로그인 없이 바로 참여하세요"}
        </Text>
      </Flex>

      {NAV_GROUPS.map((group) => (
        <Section key={group.id} title={group.title}>
          {group.entries.map((entry) => (
            <FeatureCard
              key={entry.href}
              entry={entry}
              variant={!hasCard && entry.href === "/cards" ? "cta" : "default"}
            />
          ))}
        </Section>
      ))}
    </Container>
  );
}
```

- [ ] **Step 2: `page.module.css` 참조 제거 확인 후 삭제**

Run: `grep -rn "page.module" src/app/page.tsx`
Expected: 참조 없음 → `git rm src/app/page.module.css`.

- [ ] **Step 3: 빌드 + 린트**

Run: `pnpm build && pnpm lint`
Expected: 성공.

- [ ] **Step 4: 스크린샷 검증**

`/` 방문, 320·375·768폭 스크린샷. 세 그룹(내 프로필/지금 참여하기/자료)이 순서대로, 명함 미등록 상태에서 명함 카드가 CTA(classic variant + "여기서 시작하세요")로 강조되는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/app/page.tsx
git rm src/app/page.module.css
git commit -m "feat: redesign home as journey-grouped sections with card-registration CTA"
```

---

## Phase 3 — 참가자 기능 페이지 리스타일

> **각 태스크 공통 절차:** (a) 대상 파일을 Read해 현재 마크업/핸들러를 파악, (b) 아래 매핑표대로 원시 태그·기존 CSS 모듈을 Radix 컴포넌트로 치환하되 **모든 이벤트 핸들러·atom 훅·조건 렌더 로직은 그대로 유지**, (c) 페이지 상단은 `<PageHeader>`로 통일, (d) `pnpm build && pnpm lint`, (e) 해당 라우트 Playwright 스크린샷(320·768), (f) 커밋.

**공통 매핑표:**

| 기존 | Radix 교체 |
|---|---|
| `<main><h1>` | `<PageHeader title subtitle action>` |
| `<input type=text>` | `<TextField.Root>` (아이콘 필요 시 `<TextField.Slot>`) |
| `<textarea>` | `<TextArea>` |
| `<select>` | `<Select.Root/Trigger/Content/Item>` |
| `<button>` (기본) | `<Button variant="solid">` |
| `<button>` (아이콘/좋아요) | `<IconButton variant="ghost">` + 카운트 `<Text>` |
| 카드/리스트 아이템 | `<Card size="2" variant="surface">` + `<Flex>`/`<Text>` |
| 상태 뱃지 | `<Badge color variant="soft">` (brand color 매핑: blue/red/amber/grass) |
| 아바타/이니셜 | `<Avatar fallback radius="full">` |
| 로딩 | `<Skeleton>` / `<Spinner>` |
| 모달/확인 | `<Dialog>` (정보) / `<AlertDialog>` (파괴적) |

CSS 모듈은 Radix로 대체되면 해당 `*.module.css`를 삭제하고 import 제거.

### Task 6: 명함 — 목록 + 등록 + 복구
**Files:** `src/app/(participant)/cards/page.tsx`, `src/entities/card/ui/CardListItem.tsx`, `src/features/register-card/ui/RegisterCardForm.tsx`, `src/features/recover-card/ui/*`, `src/app/(participant)/cards/[cardId]/` 프로필.
- 목록: `<PageHeader title="참가자 명함" action={<Button asChild><Link href="/cards/register">명함 등록</Link></Button>}>` + 복구 링크는 `<Button variant="ghost">`. 리스트를 `<Grid>`+`FeatureCard`류 `<Card>`로. 빈 상태는 `<Callout>` 또는 `<Text color="gray">`.
- 등록/복구 폼: 각 입력 → `<TextField.Root>`, 제출 → `<Button>`. 검증 에러는 `<Text color="red" size="1">`. 기존 `register-card`/`recover-card` model 훅·onSubmit 불변.
- `[cardId]` 프로필: `<Card>` + `<Avatar>` + `<Badge>`(GitHub/LinkedIn 링크는 `<Button variant="soft" asChild>`).

### Task 7: 키워드 (Word Cloud 제출)
**Files:** `src/views/keywords/*`, `src/features/submit-keyword/ui/*`.
- 입력+제출 → `<Flex gap><TextField.Root/><Button/></Flex>`. 내 키워드 목록 → `<Badge>` 나열(`<Flex wrap="wrap" gap="2">`). 디바운스/중복 로직 불변.

### Task 8: Q&A (질문 + 좋아요)
**Files:** `src/views/qna/*`, `src/features/ask-question/ui/*`, `src/features/toggle-like/ui/*`.
- 질문 작성 → `<TextArea>` + `<Button>`. 질문 카드 → `<Card>` + 본문 `<Text>` + 좋아요 `<IconButton variant="ghost"><HeartIcon/></IconButton>` + 카운트. 정렬/좋아요 토글 로직 불변.

### Task 9: 라이트닝 토크 신청
**Files:** `src/views/talks/*`, `src/features/apply-talk/ui/*`.
- 신청 폼(제목·설명) → `<TextField.Root>`/`<TextArea>` + `<Button>`. 신청 목록/상태 → `<Card>` + `<Badge>`(승인/대기). apply-talk model 불변.

### Task 10: 여권 (미션 + 스캔 + 경품)
**Files:** `src/views/passport/*`, `src/features/scan-passport/ui/*`.
- 진행도 → `<Flex>` + `<Badge>`(2/6) 또는 진행 카드 그리드. 미션 목록 → `<Card>` 체크 상태. QR 스캔 트리거 → `<Dialog>`(카메라/수동 입력 슬롯), jsQR 스캔 로직·scan-edge 쓰기 불변. 경품 응모 → `<Button>` + 결과 `<Callout>`.

### Task 11: I/O Bingo
**Files:** `src/views/bingo/*`, `src/features/check-bingo/ui/*` (기존 CSS 모듈 있음).
- 5×5 격자 → `<Grid columns="5" gap="2">` + 각 셀 `<Card>`/토글 버튼(달성 시 brand color soft). 빙고 판정·토글 로직 불변. 기존 `check-bingo` CSS 모듈은 격자 레이아웃만 남기고 색/보더는 Radix 토큰으로.

### Task 12: Builder Match (AI 소개)
**Files:** `src/views/match/*`, `src/features/match/ui/*`, `src/features/generate-intro/ui/*`.
- 내 AI 소개 카드 → `<Card>` + `<Text>` + 재생성 `<Button>`(캡 도달 시 `disabled` + `<Text color="gray">` 안내). 매칭 결과 목록 → `<Card>` + `<Avatar>` + 유사도 `<Badge>`. Gemini 호출·캡 로직 불변, 503 graceful degrade UI는 `<Callout color="amber">`.

### Task 13: 아카이브
**Files:** `src/views/archive/*`.
- 자료 목록 → `<Grid>` + `<Card>`(썸네일 `<Inset>`, 제목 `<Text>`, 다운로드 `<Button variant="soft" asChild>`). 필터/탭 있으면 `<Tabs>`.

---

## Phase 4 — 관리자

### Task 14: 관리자 로그인 + 보호 셸
**Files:** `src/app/admin/login/*`, `src/app/admin/(protected)/layout.tsx`, `src/widgets/admin-panel/ui/*`(셸 부분).
- 로그인: 중앙 `<Card>` + `<TextField.Root type="password">` + `<Button>`. 에러 `<Callout color="red">`. 기존 `/api/admin/login` 호출 불변.
- 보호 셸: 상단 Radix 앱바(이벤트명 + 로그아웃 `<Button>`) + 섹션 내비(`<TabNav>` 또는 사이드 `<Flex>`: 대시보드/Q&A/키워드/명함/토크/아카이브).

### Task 15: 모더레이션 패널 (Q&A·키워드·명함·토크)
**Files:** `src/views/admin/*`, `src/widgets/admin-panel/ui/*`.
- 목록 → `<Table.Root>`(Header/Body/Row/Cell). 각 행 액션: 숨김/표시 `<Button variant="soft">`, 삭제 `<AlertDialog>`(빨강 확인). 승인/거절 `<Badge>` + `<Button>`. 기존 `/api/admin/*` 호출·낙관적 업데이트 로직 불변.

### Task 16: 아카이브 관리
**Files:** `src/views/admin/*`(archive 파트).
- 업로드/등록 폼 → `<Card>` + `<TextField.Root>`/`<Button>`. 등록 목록 → `<Table>` + 삭제 `<AlertDialog>`.

> Phase 4 각 태스크: build+lint, `/admin` 관련 라우트 스크린샷(1024폭), 커밋.

---

## Phase 5 — 프로젝터 화면

### Task 17: 스크린 로컬 다크 테마 + 대형 가독성
**Files:** `src/app/screen/layout.tsx`(없으면 생성), `src/widgets/screen-feed/ui/*`, `src/widgets/screen-map/ui/*`, `src/widgets/screen-wordcloud/ui/*`, `src/widgets/screen-rotator/ui/*`, `src/app/screen/screen.module.css`.
- `screen/layout.tsx`에서 자식을 로컬 `<Theme appearance="dark" accentColor="blue" radius="large">`로 감싼다 (루트 라이트 위에 중첩 — 지원 확인됨).
- 위젯 텍스트/카드 → Radix `<Heading size="8|9">`, `<Text size="6">`, `<Card>`로 대형 스케일. 색은 다크 토큰. 기존 auto-rotator·compositor-only 애니메이션(`transform/opacity`) 로직 불변.

- [ ] build+lint, `/screen`·`/screen/feed`·`/screen/wordcloud` 스크린샷(1920폭, 다크 확인), 커밋.

---

## 최종 검증 (전체 완료 후)

- [ ] `pnpm build` 그린, `pnpm lint`(boundaries) 통과.
- [ ] 참가자 홈·대표 3화면(명함/Q&A/여권), 관리자 대시보드, 스크린 1종 스크린샷 320/375/768/1024(스크린 1920).
- [ ] 회귀 스모크: 명함 등록·복구, Q&A 좋아요, 키워드 제출, 여권 스캔, 빙고 토글, 매칭 생성 동작.
- [ ] 브랜드 옐로 텍스트 대비, Dialog/AlertDialog/Tabs 키보드 포커스 트랩 확인.
- [ ] PR 생성 (base `main`).
