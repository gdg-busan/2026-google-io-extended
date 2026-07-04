<div align="center">

```
  ██████╗ ██████╗  ██████╗     ██████╗ ██╗   ██╗███████╗ █████╗ ███╗   ██╗
 ██╔════╝ ██╔══██╗██╔════╝     ██╔══██╗██║   ██║██╔════╝██╔══██╗████╗  ██║
 ██║  ███╗██║  ██║██║  ███╗    ██████╔╝██║   ██║███████╗███████║██╔██╗ ██║
 ██║   ██║██║  ██║██║   ██║    ██╔══██╗██║   ██║╚════██║██╔══██║██║╚██╗██║
 ╚██████╔╝██████╔╝╚██████╔╝    ██████╔╝╚██████╔╝███████║██║  ██║██║ ╚████║
  ╚═════╝ ╚═════╝  ╚═════╝     ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝
```

# Google I/O Extended 2026 &mdash; Builder Board

### QR 스캔 3초, 로그인 없는 실시간 참여 플랫폼

**부산 &bull; 2026년 8월 &bull; 참가자 ~50명**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-DD2C00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

[![FSD](https://img.shields.io/badge/Architecture-Feature--Sliced_Design-4285F4?style=flat-square)](https://feature-sliced.design/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-34A853?style=flat-square)](https://makeapullrequest.com)

<br />

> *GDG Busan "Google I/O Extended 2026"을 위한 실시간 참여 플랫폼.*
> *QR 스캔 후 3초 안에 — 로그인·회원가입 없이 — 워드 클라우드, Q&A, 디지털 명함으로 참여합니다.*

<br />

</div>

---

## Overview

약 50명 규모의 커뮤니티 행사를 위해 설계된 실시간 참여 플랫폼 **Builder Board**. 참가자는 인증 화면 없이 곧바로 공유 워드 클라우드, 실시간 Q&A, 라이트닝 토크 신청, 네트워킹 키워드, 디지털 명함에 참여하고, 빅스크린 모드는 이 집단 활동을 실시간으로 행사장에 투사합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   QR 스캔  →  익명 로그인(무음)  →  즉시 참여  →  빅스크린 투사   │
│   (0 마찰)     (브라우저당 UID)     (실시간 동기화)   (/screen/*)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

성공 기준은 측정 가능합니다: **참가자 80% 접속**, **60% 디지털 명함 등록**.

### Why This Project?

- **참여 마찰 0** — QR 한 번, 이메일·비밀번호 없이 첫 참여까지 3초
- **실시간이 기본값** — 모든 데이터는 Firestore `onSnapshot`으로 스트리밍, 파생값은 계산
- **일회성답게 단순하게** — 다중 행사 추상화 금지, 행사명·날짜는 상수로 하드코딩 (YAGNI)
- **FSD 경계 준수** — `shared → entities → features → widgets → views → app` 단방향 의존성 강제

---

## Design Philosophy

> 플랫폼은 6대 원칙 위에 세워졌습니다. P0(핵심 참여 경험)는 P1(부가 기능)보다 항상 우선합니다.

```
┌─────────────────────────────────────────────────┐
│  Six Principles                                 │
│                                                 │
│  ①  참여 마찰 0          로그인·이메일 없는 즉시 참여   │
│  ②  P0 절대 보호          P1보다 항상 우선            │
│  ③  YAGNI               일회성 행사, 상수 하드코딩    │
│  ④  실시간이 기본값        onSnapshot 스트리밍         │
│  ⑤  운영 부담 최소화       managed SSR, 단일 콘솔      │
│  ⑥  FSD 경계 준수         단방향 레이어 의존성          │
└─────────────────────────────────────────────────┘
```

**신뢰 모델**: 익명 기기 식별은 *사람*이 아니라 *브라우저 프로필* 단위입니다. 중복 방지, Gemini 회수 제한, 1인 1명함은 **best-effort**이며, 50명 신뢰 커뮤니티 행사라는 전제에서 이를 수용하되 App Check로 스크립트성 남용의 문턱을 높입니다.

---

## Features

<table>
<tr>
<td width="50%">

### Builder Board (P0)
- 실시간 **워드 클라우드**
- **Q&A** 보드 (좋아요 실시간 집계)
- **라이트닝 토크** 신청
- **네트워킹 키워드**

</td>
<td width="50%">

### 디지털 명함 (P0)
- 익명 디지털 명함
- 복구 코드 흐름 (`/api/card/recover`)
- 롤링 윈도우 기준 시도 제한
- 기기가 바뀌어도 명함 복원

</td>
</tr>
<tr>
<td width="50%">

### 빅스크린 (P0)
- 전용 `/screen/*` 위젯 (워드 클라우드·맵·피드)
- 자동 로테이터
- debounce 처리된 스크린 렌더
- 컴포지터 친화적 속성만 사용

</td>
<td width="50%">

### 확장 기능 (P1)
- **Passport** — QR 스캔 수집 + 추첨
- **Builder Match** — AI 참가자 매칭
- **AI 명찰** (`/api/gemini/intro`)
- **Bingo** — Gemini 사용량 상한 보호

</td>
</tr>
</table>

**운영 콘솔 (P1)** — 승인·모더레이션을 위한 패스코드 게이트형 `/admin` 콘솔(HttpOnly 세션 쿠키, 서버 검증). 로그인은 클라이언트 IP별로 스로틀링됩니다.
**행사 후 아카이브 (P1)** — 행사의 집단 산출물을 읽기 전용으로 보존합니다.

---

## Architecture

```
[참가자 폰] ──QR──▶ Next.js App Router (SSR, Firebase App Hosting)
   │ Firebase Anonymous Auth (기기 UID) + App Check     │
   ▼                                                    ▼
Firestore ◀── onSnapshot (client components) ──▶ [빅스크린 /screen/*]
   ▲
   │ Route Handlers (app/api/*, 서버 전용 — Admin SDK / 서버 키):
   │   • /api/gemini/intro, /api/gemini/match  (UID 제한 + 전역 상한)
   │   • /api/admin/*                          (세션 쿠키 서버 검증)
   │   • /api/card/recover                     (복구 코드 검증, 시도 제한)
   ▼
[운영진 /admin] ── passcode → HttpOnly 세션 쿠키
```

실시간 참여 데이터는 클라이언트에서 `onSnapshot`으로 읽고, SSR은 최초 페인트·SEO·정적 콘텐츠를 담당합니다. 서버 전용 작업(Gemini 프록시, admin API, 명함 복구)은 Firebase Admin SDK를 사용하는 **Route Handler**(`app/api/*`)로 통합되어, 별도 Cloud Functions 없이 전체 앱이 **단일 배포 대상**으로 유지됩니다.

### Gemini Guardrails

```
요청 ──▶ App Check 검증 ──▶ UID별 사용량 상한 확인 ──▶ 전역 호출 상한 확인
                                    │                        │
                              초과 시 503                초과 시 503
                                    ▼                        ▼
                              우아한 저하 (graceful degradation)
```

---

## Project Structure (Feature-Sliced Design)

```
src/
├── app/       # Next.js App Router (라우팅, 레이아웃, Route Handler) — FSD "app" 레이어
├── views/     # 라우트 단위 화면 조립 (FSD "pages", Next.js 예약어 회피용 이름)
├── widgets/   # 조합된 UI 블록 (word-cloud-board, screen-rotator, admin-panel, event-qr, ...)
├── features/  # 사용자 행동 (submit-keyword, register-card, recover-card, match, scan-passport, ...)
├── entities/  # 도메인 슬라이스 (card, question, like, talk, keyword, session, match, bingo, ...)
└── shared/    # firebase (client/admin init), config (행사 상수), gemini, lib, ui-kit
```

의존성 방향은 단방향입니다: `shared → entities → features → widgets → views → app`. 역방향 import는 `eslint-plugin-boundaries`로 차단됩니다(`eslint.config.mjs` 참조).

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** (`pnpm@9.15.4`)
- **Firebase CLI**

> 기본적으로 로컬 Firebase 에뮬레이터 스위트만으로 완전히 동작하므로, 시작하는 데 실제 Firebase 프로젝트가 필요하지 않습니다.

### 1. Clone & Install

```bash
git clone https://github.com/gdg-busan/2026-google-io-extended.git
cd 2026-google-io-extended
pnpm install
```

### 2. Run with Emulators

```bash
pnpm emulators   # Firestore + Auth 에뮬레이터 (별도 터미널)
pnpm dev
```

[http://localhost:3000](http://localhost:3000) 을 엽니다. 커스터마이즈하려면 `.env.local.example`을 `.env.local`로 복사하세요.

---

## Scripts

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 빌드 서빙 |
| `pnpm lint` | ESLint (FSD 경계 검사 포함) |
| `pnpm emulators` | Firestore + Auth 에뮬레이터 (`firebase.json`) |
| `pnpm test:rules` | Firestore 보안 규칙 테스트 (Vitest) |

---

## API Routes

| Method | Route | Description |
|--------|-------|------------|
| `POST` | `/api/gemini/intro` | AI 명찰 소개 생성 (UID 제한 + 전역 상한) |
| `POST` | `/api/gemini/match` | AI 참가자 매칭 (UID 제한 + 전역 상한) |
| `POST` | `/api/card/recover` | 디지털 명함 복구 (복구 코드 검증, 시도 제한) |
| `*` | `/api/admin/*` | 운영 콘솔 액션 (세션 쿠키 서버 검증) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Database | [Cloud Firestore](https://firebase.google.com/docs/firestore) (Realtime `onSnapshot`) |
| Auth | [Firebase Anonymous Auth](https://firebase.google.com/docs/auth) + [App Check](https://firebase.google.com/docs/app-check) |
| AI | [Gemini API](https://ai.google.dev/) (서버 사이드 프록시 + 사용량 상한) |
| UI Kit | [Radix Themes](https://www.radix-ui.com/themes) |
| State | [Jotai](https://jotai.org/) |
| Validation | [Zod](https://zod.dev/) |
| Architecture | [Feature-Sliced Design](https://feature-sliced.design/) (`eslint-plugin-boundaries`) |
| Testing | [Vitest](https://vitest.dev/) (Firestore Rules) |

---

## Configuration Files

Firebase 배포·보안을 위한 `firebase.json`, `firestore.rules`, `firestore.indexes.json`, lint 및 FSD 경계 강제를 위한 `eslint.config.mjs`, Next.js 빌드를 위한 `next.config.ts`, 그리고 `tests/` 하위의 Firestore 규칙 테스트를 위한 Vitest 설정을 포함합니다.

---

## Contributing

Contributions are welcome! 이슈와 PR을 환영합니다.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

> 커밋과 PR은 [Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

---

<div align="center">

**Built with** ❤️ **by [GDG Busan](https://gdg.community.dev/gdg-busan/)**

*Made for GDG Busan "Google I/O Extended 2026"*

[![GDG Busan](https://img.shields.io/badge/GDG-Busan-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://gdg.community.dev/gdg-busan/)

</div>
