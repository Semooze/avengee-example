# Gallery and Hotel Implementation Plan

> Implement task-by-task in this session with focused tests and a final review.

**Goal:** Deliver the Avengee gallery and a complete Serein booking demo.
**Architecture:** Next.js frontend with an embedded, compiled NestJS API and libSQL persistence. Shared hotel catalogue and types keep pricing consistent.
**Tech Stack:** TypeScript, Next.js, React, NestJS, libSQL, Zod, Playwright.
**Spec:** docs/superpowers/specs/2026-11-01-gallery-hotel-design.md

## Global constraints

- Only hotel booking is live; remaining projects are planned.
- No real payments or card collection.
- Vercel requires a remote libSQL database for durable bookings.
- Server owns prices, availability, and authorization.

## Review focus

- Invalid dates, excessive guests, and tampered prices must fail safely.
- Duplicate requests and concurrent last-room bookings must not oversell.
- Booking references without valid management tokens cannot disclose guest data.
- Reloading must preserve booking access and cancellations.
- API/network failures and narrow screens must remain usable.

## Task 1: Booking foundation

Files: package.json, packages/domain/_, packages/api/src/_, tests/api.test.cjs.
Interfaces: GET /api/hotels; GET /api/hotels/:id/availability; POST /api/bookings; GET/DELETE /api/bookings/:id with bearer token.

- [x] Write failing API integration tests.
- [x] Implement catalogue, validation, durable repository, and NestJS controllers.
- [x] Verify tests and compilation.

## Task 2: Gallery and booking experience

Files: app/_, components/_, lib/*, pages/api/[[...path]].ts, tests/e2e.spec.ts.
Interfaces: /, /stays, /stays/[id], /stays/checkout, /stays/bookings.

- [x] Write browser acceptance coverage.
- [x] Implement responsive gallery, search, details, checkout, and booking management.
- [ ] Verify full journey and mobile layout in a browser — blocked by unavailable Chrome connection and sandbox localhost access.

## Task 3: Delivery

Files: README.md, .env.example, vercel.json, docs/progress.md.

- [x] Run tests, typecheck, production build, and independent review.
- [x] Document setup, deployment, API, and demo limitations.
- [ ] Deploy — prerequisites inspected; Vercel authentication and hosted database configuration are missing.
