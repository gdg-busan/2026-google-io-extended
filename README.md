# io2026 — GDG Busan Google I/O Extended 2026 Builder Board

Next.js App Router + FSD architecture. Plan: `.omc/plans/ralplan-io2026-builder-board.md`.

## Getting Started

```bash
npm install
npm run emulators   # Firestore + Auth emulators (separate terminal)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy `.env.local.example` to
`.env.local` to customize — the app runs fully against the local Firebase
emulator suite by default, no real Firebase project required yet.

## Structure (Feature-Sliced Design)

```
src/
├── app/       # Next.js App Router (routing, layouts, Route Handlers) — FSD "app" layer
├── views/     # route-level screen assembly (FSD "pages", renamed to avoid the Next.js reserved word)
├── widgets/   # composed UI blocks (word-cloud-board, card-wall, screen-carousel, admin-panel, ...)
├── features/  # user actions (submit-keyword, register-card, recover-card, ...)
├── entities/  # domain slices (card, question, like, talk, keyword, session, ...)
└── shared/    # firebase (client/admin init), config (event constants), lib, ui-kit
```

Dependency direction is one-way: `shared → entities → features → widgets → views → app`.
Reverse imports are blocked by `eslint-plugin-boundaries` (see `eslint.config.mjs`).

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint (includes FSD boundary checks)
- `npm run emulators` — Firestore + Auth emulators (`firebase.json`)
