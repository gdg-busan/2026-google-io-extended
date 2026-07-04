# Builder Board — Radix 기반 프론트엔드 재설계

**작성일**: 2026-07-04
**대상**: GDG Busan — Google I/O Extended 2026 (Next.js 16 / React 19 / Firebase / Jotai / FSD)

## 1. 문제 정의

현재 홈(`src/app/page.tsx`)은 8개 기능이 동일 가중치로 나열된 **플랫 디렉터리 그리드**다. 참가자가 QR로 진입했을 때 "무엇부터", "지금 뭐가 열려 있는지", "내가 뭘 했는지"에 대한 안내가 없어 관리자/디렉터리 관점으로 읽힌다. 또한 공유 디자인 시스템이 없어(빈 `src/shared/ui-kit/`, 최소 `globals.css`) 화면마다 애드혹 CSS 모듈로 흩어져 있다.

## 2. 목표

- **Radix Themes**를 프론트엔드 전체(참가자·관리자·프로젝터 화면)의 디자인 시스템 기반으로 도입.
- **GDG / Google I/O 브랜드** 비주얼: Google 4색 accent, 라이트 톤, 둥근·친근한 카드.
- 홈을 **여정 단계별 그룹**으로 재구성해 참가자 관점의 흐름을 제공.
- 로직·상태·API는 불변, **UI 표현 레이어만** 교체 (FSD 준수, `eslint-plugin-boundaries` 통과 유지).

### 비목표 (이번 스펙 밖)
- 다크/시스템 모드 토글 (참가자·관리자 화면). 라이트 고정. 후속 과제.
- Firestore 스키마·기능 로직·Gemini 파이프라인 변경.
- 새 기능 추가. 순수 프레젠테이션 재설계.

## 3. 결정 사항 (확정)

| 항목 | 결정 |
|---|---|
| 홈 정보구조 | 여정 단계별 그룹 (내 프로필 / 지금 참여하기 / 자료) |
| Radix 방식 | **Radix Themes** (스타일드 라이브러리) + GDG 브랜드 토큰 오버라이드 |
| 비주얼 방향 | GDG/Google I/O 브랜드, 라이트 톤 |
| 범위 | 프론트 전체 — 참가자 8페이지 + 홈 + 관리자 + 프로젝터 화면 |

## 4. 디자인 시스템 기반

### 4.1 Radix Themes 도입
- 의존성 추가: `@radix-ui/themes` (Radix Primitives는 Themes에 포함/전이 의존).
- 루트 `src/app/layout.tsx`에서 `import "@radix-ui/themes/styles.css"` 후 브랜드 토큰 CSS import, `<Theme>`로 앱 래핑:
  - `appearance="light"`, `accentColor="blue"`, `grayColor="slate"`, `radius="large"`, `scaling="100%"`.
- `globals.css`: CSS 리셋(`box-sizing`, margin/padding 0, `overflow-x`)은 유지, **자동 다크모드 오버라이드 블록 제거** (Radix `appearance`가 테마 담당). 폰트 변수(`--font-geist-sans/mono`)는 유지.

### 4.2 GDG 브랜드 토큰
- `src/shared/config/theme.ts`: 카테고리→색 매핑을 타입 안전 상수로.
  - Google 4색: `blue #4285F4`, `red #EA4335`, `yellow #F9AB00`(텍스트 대비용 진한 톤), `green #34A853`.
  - 8개 기능 각각에 카테고리 색 1개 배정 (아이콘 칩 틴트/배지용).
- `src/app/theme.css`: 위 색을 CSS 커스텀 프로퍼티(`--brand-blue` 등)로 노출. 인터랙티브 요소는 Radix `blue` accent로 통일, 브랜드 4색은 **카테고리 식별**(아이콘 칩 배경, 배지)에만 사용.
- Radix `<Badge color>`/`<Button color>`에 넘길 때는 Google 색을 가장 가까운 Radix 스케일(`blue`/`red`/`amber`/`grass`)로 매핑.

### 4.3 공유 UI 키트 (`src/shared/ui-kit/` 신설 컴포넌트)
- `PageHeader` — 타이틀 + 서브타이틀 + 선택적 액션 슬롯.
- `Section` — 섹션 제목(`Heading`) + 자식 그리드 컨테이너.
- `FeatureCard` — 아이콘 칩(브랜드 색 틴트) + 라벨 + 설명, `next/link`를 `asChild`로 래핑, `variant`(default/primary-cta) 지원.
- FSD상 `shared` 레이어 → 모든 상위 레이어에서 import 허용, boundaries 규칙 위반 없음.

## 5. 참가자 공통 셸

`src/app/(participant)/layout.tsx` **신설** (현재 없음). 8개 페이지가 공유:
- **상단 앱바** (`Flex`): 좌측 홈/뒤로 링크, 중앙 이벤트 마크(`Builder Board`), 우측 **신원 칩** — 명함 등록 시 닉네임 이니셜 `<Avatar>`, 미등록 시 "명함 만들기" `Button`.
- **페이지 컨테이너**: `<Container size="1">` 모바일 우선 일관 패딩.
- 신원 상태는 세션 uid로 "내 명함 등록 여부" 불리언 하나만 파생 (`entities/card` 아톰 재사용, 신규 상태 없음).

## 6. 홈 재설계 (여정 단계별 그룹)

`src/app/page.tsx` 재작성:
- **컴팩트 히어로**: 이벤트명·날짜·"로그인 없이 바로 참여". 현재의 거대 타이틀 축소. 명함 있으면 "환영해요, {닉네임}" 개인화.
- **① 내 프로필**: 명함, 매칭. **명함 미등록 시 명함 카드를 `primary-cta` variant로 강조** ("여기서 시작하세요"). 여정 그룹 유지 + 참가자 관점의 "지금 뭐부터?"를 가볍게 해결 (풀 대시보드 아님).
- **② 지금 참여하기**: 여권·빙고·토크·Q&A·키워드. 저비용으로 얻을 수 있으면 여권 진행도(예: 2/6) 작은 라이브 배지 (없으면 생략, 필수 아님).
- **③ 자료**: 아카이브.
- 각 섹션 = `Section` + `FeatureCard` 그리드. `ENTRIES` 배열은 3개 그룹 구조로 재편.

## 7. 기능 페이지 리스타일 (프론트 전체)

로직/atoms/API **불변**, `views/` · `features/*/ui/` 프레젠테이션만 교체.

### 7.1 참가자 (8)
- 폼(명함 등록·복구, 키워드, 토크, Q&A 작성) → `TextField`/`TextArea`/`Button`/`Select`/`Checkbox`.
- 리스트·프로필(명함, Q&A, 매칭) → `Card`/`Flex`/`Text`/`Badge`/`Avatar`.
- Q&A 좋아요 → `IconButton` + 카운트. 여권 미션 → `Card` + 진행도, 스캔은 `Dialog`. 빙고 → 토글 셀 그리드. 매칭 → AI 소개 `Card` + 생성 `Button`.

### 7.2 관리자 (`/admin`)
- 로그인(`admin/login`) → Radix `Card`+`TextField`+`Button`.
- 보호 영역 공통 셸(`admin/(protected)/layout.tsx`) → Radix 앱바 + 섹션 내비.
- 모더레이션(Q&A/키워드/명함/토크) `admin-panel` 위젯 → `Table`/`Tabs`/`Badge`/`Button`, 승인·삭제 확인은 `AlertDialog`.
- 아카이브 관리 → `Card`/`Table` 폼.

### 7.3 프로젝터 화면 (`/screen`)
- 피드·맵·워드클라우드·로테이터: 대형·암실 환경 → 해당 서브트리를 로컬 `<Theme appearance="dark" accentColor="blue">`로 감싸 **다크 유지**.
- Radix 타이포/스페이싱 스케일로 대형 화면 가독성 정리. 애니메이션은 기존 compositor-only 유지.

## 8. 아키텍처 / 컴포넌트 경계

- **shared/ui-kit**: `PageHeader`, `Section`, `FeatureCard` — 순수 프레젠테이션, props로만 소통, 도메인 의존 없음.
- **(participant)/layout, admin/(protected)/layout**: 셸. 세션·명함 아톰을 읽어 신원 칩 렌더. 자식 페이지와 slot(`children`)으로만 결합.
- **views/features UI**: Radix 컴포넌트로 표현, 기존 model/api 훅 그대로 호출. 각 view는 독립적으로 교체 가능(한 페이지 변경이 다른 페이지에 영향 없음).
- Theme 래핑은 루트(라이트) + `/screen` 로컬(다크). admin/participant는 루트 상속.

## 9. 에러 처리 / 엣지 케이스

- 신원 미확정(`isAuthReadyAtom=false`) 시 앱바 신원 칩은 스켈레톤/중립 상태, 깜빡임 방지.
- 명함 미등록 상태에서 홈 CTA·앱바 프롬프트 일관 동작.
- 브랜드 옐로(`#F9AB00`)는 흰 배경 텍스트 대비 부족 → 텍스트/아이콘엔 진한 톤, 큰 면적 틴트에만 원색.
- `/screen` 다크 로컬 테마가 루트 라이트와 충돌하지 않도록 서브트리 한정.

## 10. 테스트 / 검증

- **빌드**: `pnpm build` 그린, `eslint`(boundaries 포함) 통과.
- **비주얼**: Playwright 스크린샷 — 홈, 참가자 대표 3화면, 관리자 대시보드, 스크린 1종 @ 320/375/768/1024.
- **접근성**: 키보드 내비(Dialog/AlertDialog/Tabs 포커스 트랩), 브랜드 색 대비 확인.
- **회귀**: 기존 기능 동작(명함 등록·복구, Q&A 좋아요, 여권 스캔, 빙고 토글, 매칭 생성) 수동 스모크.

## 11. 단계별 구현 순서

1. **Phase 1 — 기반/토큰**: `@radix-ui/themes` 설치, 루트 Theme, `theme.ts`/`theme.css`, `globals.css` 정리, ui-kit 3종.
2. **Phase 2 — 참가자 셸 + 홈**: `(participant)/layout.tsx`, 홈 여정 그룹 재작성.
3. **Phase 3 — 참가자 기능 8페이지**: 폼/리스트/인터랙션 Radix 교체.
4. **Phase 4 — 관리자**: 로그인·보호 셸·모더레이션·아카이브.
5. **Phase 5 — 프로젝터 화면**: 다크 로컬 테마 + 대형 가독성.

각 Phase 끝에 빌드+스크린샷 검증.
