# GDG Busan — Google I/O Extended 2026 Builder Board

## 프로젝트 개요

이 저장소는 GDG Busan의 "Google I/O Extended 2026" 행사(부산, 2026년 8월 중순)를 위해 제작된 실시간 참여 플랫폼 **Builder Board**를 담고 있습니다. 약 50명 규모의 커뮤니티 행사를 위해 설계되었으며, 참가자는 **QR 스캔 후 3초 안에** — 로그인·회원가입·이메일 입력 없이 — 공유 워드 클라우드, 실시간 Q&A, 라이트닝 토크 신청, 네트워킹 키워드, 디지털 명함을 통해 참여할 수 있습니다. 빅스크린 모드는 이 집단 활동을 실시간으로 행사장에 투사합니다.

성공 기준은 측정 가능합니다: **참가자 80% 접속**, **60% 디지털 명함 등록**.

## 핵심 기술 스택

이 애플리케이션은 최신 웹 기술로 구축되었습니다. **Next.js 16 (App Router) + React 19**와 TypeScript, 실시간 데이터 동기화를 위한 **Cloud Firestore**, 마찰 없는 기기 식별을 위한 **Firebase Anonymous Authentication + App Check**, AI 기능을 위한 **Gemini API**(서버 사이드 프록시 + 엄격한 사용량 상한), 클라이언트 상태 관리를 위한 **Jotai**, 경계 검증을 위한 **Zod**를 사용합니다. 코드베이스는 **Feature-Sliced Design(FSD)** 으로 구성되며, 단방향 레이어 의존성을 `eslint-plugin-boundaries`로 강제합니다.

## 주요 기능

**참여 마찰 0** — QR 스캔 한 번으로 곧바로 Builder Board에 진입합니다. Firebase 익명 로그인(브라우저당 안정적인 UID)이 조용히 수행되어, 인증 화면 없이 즉시 첫 참여 행동이 가능합니다.

**실시간이 기본값** — 모든 참여 데이터는 Firestore `onSnapshot` 구독을 통해 클라이언트로 스트리밍됩니다. 새로고침 없이 참가자 폰과 빅스크린에 즉시 반영되며, 파생값(좋아요 수 등)은 저장하지 않고 계산합니다.

**Builder Board (P0)** — 참가자 웹앱의 핵심: 실시간 **워드 클라우드**, **Q&A** 보드, **라이트닝 토크** 신청, **네트워킹 키워드**.

**디지털 명함 (P0)** — 익명 디지털 명함과 복구 코드 흐름(`/api/card/recover`, 롤링 윈도우 기준 시도 제한)을 제공하여 기기가 바뀌어도 명함을 복원할 수 있습니다.

**빅스크린 (P0)** — 전용 `/screen/*` 위젯(워드 클라우드·맵·활동 피드)과 자동 로테이터. 스크린 렌더는 debounce 처리되고 컴포지터 친화적 속성만 사용해 부드럽게 투사됩니다.

**확장 기능 (P1)** — Gemini 기반 애드온 4종: **Passport**(QR 스캔 엣지 수집 + 추첨), **Builder Match**(AI 참가자 매칭), **AI 명찰**(`/api/gemini/intro`), **Bingo**. Gemini 사용량은 UID별 상한과 전역 호출 상한으로 보호되며, 한도 초과 시 우아하게 저하(503)됩니다.

**운영 콘솔 (P1)** — 승인·모더레이션을 위한 패스코드 게이트형 `/admin` 콘솔(HttpOnly 세션 쿠키, 서버 검증). 로그인은 클라이언트 IP별로 스로틀링됩니다.

**행사 후 아카이브 (P1)** — 행사의 집단 산출물을 읽기 전용으로 보존하는 아카이브.

## 설계 철학

플랫폼은 6대 원칙 위에 세워졌습니다: **참여 마찰 0**, **P0 절대 보호(P1보다 우선)**, **일회성답게 단순하게(YAGNI)** — 다중 행사 추상화 금지, 행사명·날짜는 상수로 하드코딩 — **실시간이 기본값**, **운영 부담 최소화**(managed SSR, 특수 하드웨어 없음, 단일 운영 콘솔), **FSD 경계 준수**.

신뢰 모델은 명시적으로 규정됩니다: 익명 기기 식별은 *사람*이 아니라 *브라우저 프로필* 단위입니다. 중복 방지, Gemini 회수 제한, 1인 1명함은 **best-effort**이며, 50명 신뢰 커뮤니티 행사라는 전제에서 이를 수용하되 App Check로 스크립트성 남용의 문턱을 높입니다.

## 데이터 아키텍처

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

## 시작하기

**Node.js 18+** 와 Firebase CLI가 필요합니다. 기본적으로 로컬 Firebase 에뮬레이터 스위트만으로 완전히 동작하므로, 시작하는 데 실제 Firebase 프로젝트가 필요하지 않습니다.

```bash
npm install
npm run emulators   # Firestore + Auth 에뮬레이터 (별도 터미널)
npm run dev
```

[http://localhost:3000](http://localhost:3000) 을 엽니다. 커스터마이즈하려면 `.env.local.example`을 `.env.local`로 복사하세요.

## 프로젝트 구조 (Feature-Sliced Design)

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

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 빌드 서빙 |
| `npm run lint` | ESLint (FSD 경계 검사 포함) |
| `npm run emulators` | Firestore + Auth 에뮬레이터 (`firebase.json`) |
| `npm run test:rules` | Firestore 보안 규칙 테스트 (Vitest) |

## 설정 파일

Firebase 배포·보안을 위한 `firebase.json`, `firestore.rules`, `firestore.indexes.json`, lint 및 FSD 경계 강제를 위한 `eslint.config.mjs`, Next.js 빌드를 위한 `next.config.ts`, 그리고 `tests/` 하위의 Firestore 규칙 테스트를 위한 Vitest 설정을 포함합니다.
