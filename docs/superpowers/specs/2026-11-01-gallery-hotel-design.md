# Avengee gallery and Serein hotel demo

The user selected a gallery and a complete hotel-booking demo as the first release. Build this scope now; ticketing, massage, delivery, commerce, and ERP appear as explicitly planned projects, not working links.

## Experience

The gallery presents a featured live hotel demo and five future projects. Serein offers curated fictional Thai stays: destination/date/guest search, price and amenity filters, sorting, hotel details, room selection, a server-priced reservation, guest details, a simulated payment confirmation, and booking retrieval/cancellation. No card data or real charges. Demo data is labeled. No real hotel inventory, email delivery, accounts, or production payment integration is implied.

## Design direction

Gallery: white, navy (#102C42), blue (#2162CA), slate (#647687), pale blue (#EAF2F8). Serein: sea blue (#215D74), white (#FFFFFF), mist (#F1F6F8), ink (#153747), sun (#E7C785). Use a quiet sans-serif interface and Georgia editorial headlines for the travel brand. Large landscape photography is the defining element; spacious left-aligned content, readable forms, and a restrained rounded card system. Mobile navigation, keyboard focus, reduced motion, form labels, and explicit loading/error/empty states are required.

## Architecture and persistence

One npm workspace repository: Next.js frontend at root and a compiled NestJS package in packages/api. A Next.js Pages API catch-all delegates Node requests to the initialized Nest Express app, giving one origin and one Vercel project. Shared serializable catalogue/types live in packages/domain. Use libSQL: a local SQLite file for development and TURSO_DATABASE_URL/TURSO_AUTH_TOKEN for Vercel. On Vercel without remote database configuration, catalogue remains available and bookings return a clear unavailable error; never silently use ephemeral persistence.

Server validates dates, capacity, room identity, and guest details; calculates prices in integer THB; rejects overlapping reservations when room stock is exhausted within a write transaction. A random management token authorizes booking retrieval/cancellation; only its hash is stored. Idempotency keys prevent duplicate submissions. Booking references alone grant no access. Client remembers booking management links in this browser, with a clear privacy note.

## Acceptance

Run production build, TypeScript checks, backend integration tests for pricing/validation/persistence/inventory/access/cancellation/idempotency, and browser tests for gallery-to-booking-to-cancellation plus mobile layout. Provide deployment configuration and instructions. Attempt Vercel deployment only with available account authentication and durable database configuration; report missing prerequisites honestly.
