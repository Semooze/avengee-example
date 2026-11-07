<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Avengee examples

Avengee's company showcase: a gallery (`/`) plus six fictional demos. Content is bilingual Thai + English.

## Layout

- `app/` — routes: `/`, `/stays` (Serein, full booking flow), `/tickets`, `/massage`, `/delivery`, `/shop`, `/erp`
- `components/` — UI; `demo-bar.tsx` wraps every demo, `showcase-data.ts` drives the landing carousel
- `app/globals.css` — all styles (plain CSS, design tokens on `:root`); no Tailwind
- `packages/domain`, `packages/api` — shared types and the NestJS booking API, served via `pages/api/[[...path]].ts`
- Database: libSQL, local `serein.db`; Vercel requires `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`

## Commands

```sh
npm run dev         # builds packages, then next dev
npm run typecheck
npm test            # API integration tests
npm run test:e2e    # Playwright; own server on :3210 with a fresh e2e.db
npm run build
```

## Rules

- Run typecheck, `npm test` and `npm run test:e2e` before calling work done; never weaken assertions to pass.
- Playwright matches by partial text: keep visible strings unique (e.g. only one "Explore hotel demo" link on `/`).
- Thai text: no negative letter-spacing; keep line-height ≥ 1.3 for headings.
- Fonts load via `next/font` in `app/layout.tsx`; no new heavy dependencies.
- Demo data is fictional; never invent real clients, metrics or contact details.
- Format with Prettier.
