# Avengee examples

A project gallery and six fictional, interactive demos built with Next.js, React, TypeScript, and NestJS. Serein is a complete hotel-booking flow backed by the demo API. Goodtime ticketing, Still House massage booking, Good Neighbor delivery, Sunday Goods shop, and the Sunday Goods ERP workspace demonstrate their customer or operations flows with sample data.

## Run locally

Use Node.js 22 or 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open **http://localhost:3000** for the gallery. Demo routes:

| Route | Demo | Main flow |
| --- | --- | --- |
| `/stays` | Serein stays | Search hotels, check availability, book, manage, and cancel |
| `/tickets` | Goodtime | Choose an event, set ticket quantity, simulate payment, and print a ticket |
| `/massage` | Still House | Choose a treatment and appointment, then reserve |
| `/delivery` | Good Neighbor | Search dishes, build a basket, enter a delivery address, and place a demo order |
| `/shop` | Sunday Goods shop | Browse products, adjust quantities, and complete a demo checkout |
| `/erp` | Sunday Goods workspace | Review sample revenue and inventory, search orders, and mark orders complete |

No credentials are needed locally. Serein's database is created automatically at `serein.db` and survives restarts. The other demos use fictional in-page data and do not process real payments or persist orders.

```sh
npm test           # Real NestJS request integration tests, no listening socket needed
npm run typecheck  # All workspaces + frontend TypeScript
npm run build     # Compile NestJS/domain, then production Next.js build
npm run test:production # Build and exercise the compiled Next.js → NestJS API
npm start         # Run the production build
```

For browser tests on a machine where Playwright may launch Chromium and access localhost:

```sh
npx playwright install chromium
npm run test:e2e
```

The browser suite covers the Serein booking lifecycle and searches, plus the event ticket, massage reservation, delivery basket, shop checkout, and ERP order actions. Run it against a local test database, never a shared production database. Serein browser tests create demo reservations and cancel the end-to-end booking.

## What works

- Responsive gallery with six interactive app demos.
- Six fictional Thai hotels, destination/date/guest search, category/pool/price filters, and sorting.
- Hotel details, room types, live inventory checks, and transparent THB pricing.
- Guest details, validated dates/capacity, server-calculated totals, and simulated checkout.
- Persistent reservations, private management links, manual lookup, and cancellation.
- Atomic inventory checks and inserts, idempotent booking requests, token-protected access.
- Loading, validation, empty, unavailable, and error states.
- Fictional event ticketing with quantity totals and printable confirmation.
- Massage treatment and appointment selection with reservation confirmation.
- Local food search, basket totals, address entry, and delivery confirmation.
- Product browsing, quantity controls, and demo checkout.
- ERP overview with searchable sample orders, status updates, and stock watch.

Prices are whole Thai baht, not satang; 10% demo taxes/fees are added once to the stay subtotal. Each booking reserves one room for 1–4 guests, 1–30 nights, with check-in within the next year. Check-in is inclusive and check-out exclusive. Inventory is tracked by room type and nightly occupancy.

## Deploy to Vercel

This repository deploys as **one Next.js project**. Its `/api/*` route delegates to a compiled NestJS Express application. There is no separate backend URL or CORS setup.

1. Create a hosted Turso/libSQL database. Obtain its `libsql://…` URL and database auth token from your account.
2. Import this repository into Vercel (root directory: repository root, framework: Next.js, Node.js: 22.x or 24.x). `vercel.json` supplies the build/install commands.
3. Add server-only environment variables to the deployment:

   | Variable             | Value                              |
   | -------------------- | ---------------------------------- |
   | `TURSO_DATABASE_URL` | Hosted `libsql://…` URL            |
   | `TURSO_AUTH_TOKEN`   | Token authorized for that database |

4. Deploy. The database table and index initialize on first reservation/availability request. Use separate databases for Preview and Production to keep preview tests isolated.
5. Verify `/api/health`, open a hotel, create a demo reservation, reload its private link, and cancel it.

Alternatively, after installing the official Vercel CLI and signing in, run `vercel` in this directory, configure the same variables, and run `vercel --prod` when ready. Keep credentials in your local environment or Vercel dashboard, never in committed files or chat.

**Deployment status:** No Vercel project is linked and no hosted database credentials are supplied in this workspace. The code is configured for deployment but has not been published. On Vercel without a remote database, the gallery/catalogue still render; availability and reservation requests return a clear 503 instead of silently writing data to ephemeral storage.

### Deployment references

- [Vercel Next.js deployments](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Next.js API routes and external resolvers](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [Turso TypeScript SDK](https://docs.turso.tech/sdk/ts/quickstart)

## Layout

```text
app/                  Next.js pages, layouts, responsive stylesheet
components/           Gallery, hotel booking, ticketing, storefront, and ERP UI
lib/client.ts         API client and browser-held booking access
pages/api/            Same-origin Next.js → NestJS adapter
packages/api/src/     NestJS controllers, validation, booking service, database
packages/domain/src/  Shared types, fictional hotel catalogue, pricing
tests/                Request-level integration and browser acceptance tests
docs/                 Design, plan, verification notes
```

`npm run dev` compiles shared packages once before starting Next.js. After editing backend/domain code, restart it (or run `npm run build:packages`) to rebuild those packages. The frontend hot reloads normally.

## API

| Method | Endpoint                                                                       | Purpose                                                     |
| ------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| GET    | `/api/health`                                                                  | Application health (does not verify DB connectivity)        |
| GET    | `/api/hotels`                                                                  | Fictional hotel catalogue                                   |
| GET    | `/api/hotels/:id/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=2` | Remaining inventory and room totals                         |
| POST   | `/api/bookings`                                                                | Create a reservation                                        |
| GET    | `/api/bookings/:id`                                                            | Retrieve with `Authorization: Bearer <token>`               |
| DELETE | `/api/bookings/:id`                                                            | Cancel with the same bearer token; retains the audit record |

Creation accepts exactly `hotelId`, `roomId`, `checkIn`, `checkOut`, `guests`, `firstName`, `lastName`, `email`, and a UUID `idempotencyKey`. Unknown fields, including client-supplied prices, are rejected. Creation returns a management `token`; subsequent reads do not return it. The database stores only its hash. Reusing an idempotency key for the same payload returns the original reservation and token; using it for different details returns 409.

## Demo boundaries

This is a working example, **not a real travel service**. Properties, ratings, and availability are fictional. Photographs from Unsplash are illustrative and fonts load from Google Fonts; browser network access is required for these assets, with system-font fallbacks. No real hotel inventory, card details, payments, confirmation emails, account login, or admin console are included.

Booking access is a bearer capability: anyone with a private management link can view/cancel that booking. The token is in the URL fragment (not the query) and browser local storage, and its hash is stored server-side. Use sample guest details. For a commercial release, replace this model with account authentication and authorization, add durable rate limits/abuse prevention, real payments and webhook verification, retention rules, and real inventory integrations.
