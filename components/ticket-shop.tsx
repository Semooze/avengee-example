'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CalendarDays, MapPin, TicketCheck } from 'lucide-react';
import { DemoBar } from '@/components/demo-bar';

const events = [
  {
    id: 'night-market',
    name: 'Afterglow Night Market',
    type: 'MUSIC · BANGKOK',
    date: 'Saturday, 14 November · 6:00 PM',
    place: 'ChangChui Creative Park',
    price: 890,
    image: 'photo-1501386761578-eac5c94b800a',
    tone: 'violet',
  },
  {
    id: 'coastline',
    name: 'Coastline Sounds',
    type: 'MUSIC · PHUKET',
    date: 'Sunday, 22 November · 4:30 PM',
    place: 'Kata Beach Garden',
    price: 1250,
    image: 'photo-1459749411175-04bf5292ceea',
    tone: 'blue',
  },
  {
    id: 'slow-sunday',
    name: 'Slow Sunday Sessions',
    type: 'COMMUNITY · CHIANG MAI',
    date: 'Saturday, 28 November · 10:00 AM',
    place: 'Jing Jai Market',
    price: 490,
    image: 'photo-1514525253161-7a46d19cd819',
    tone: 'amber',
  },
];
const money = (value: number) => `฿${value.toLocaleString('en-US')}`;
const bar = (
  <DemoBar name="Goodtime" kind="Ticketing" next={{ href: '/massage', name: 'Still House' }} />
);

function TicketNav({ tagline }: { tagline: string }) {
  return (
    <header className="ticket-nav">
      <Link href="/tickets" className="ticket-wordmark">
        goodtime<span aria-hidden>✳</span>
      </Link>
      <span>{tagline}</span>
    </header>
  );
}

export default function TicketShop() {
  const [selected, setSelected] = useState(events[0]);
  const [quantity, setQuantity] = useState(1);
  const [ticket, setTicket] = useState(false);

  if (ticket)
    return (
      <>
        {bar}
        <main className="ticket-page" lang="en">
          <TicketNav tagline="YOUR PLANS, SORTED" />
          <section className="ticket-confirm">
            <div className="ticket-success-icon">
              <TicketCheck size={31} aria-hidden />
            </div>
            <span className="ticket-eyebrow">YOU’RE ON THE LIST</span>
            <h1>Your night starts here.</h1>
            <p className="ticket-confirm-lead">
              Your demo tickets are ready. Show this pass at the door.
            </p>
            <article className="digital-ticket">
              <div
                className="digital-ticket-image"
                style={{
                  backgroundImage: `linear-gradient(0deg,#102831aa,transparent),url(https://images.unsplash.com/${selected.image}?auto=format&fit=crop&w=900&q=85)`,
                }}
              >
                <span>GOODTIME PRESENTS</span>
                <strong>{selected.name}</strong>
              </div>
              <div className="digital-ticket-details">
                <span>{selected.date}</span>
                <span>{selected.place}</span>
                <b>
                  {quantity} {quantity === 1 ? 'ticket' : 'tickets'} ·{' '}
                  {money(quantity * selected.price)}
                </b>
                <code>DEMO-{selected.id.toUpperCase()}-2026</code>
              </div>
            </article>
            <button className="button" onClick={() => window.print()}>
              Print your ticket <ArrowRight size={17} aria-hidden />
            </button>
            <button className="ticket-reset" onClick={() => setTicket(false)}>
              Back to events
            </button>
            <p className="ticket-demo-note">Demo ticket only · No real payment was processed</p>
          </section>
        </main>
      </>
    );

  return (
    <>
      {bar}
      <main className="ticket-page" lang="en">
        <TicketNav tagline="GOOD TIMES, IN GOOD COMPANY" />
        <section className="ticket-hero">
          <span className="ticket-eyebrow">MAKE A NIGHT OF IT</span>
          <h1>
            Find your next
            <br />
            <em>favorite memory.</em>
          </h1>
          <p>Live music, local flavor, and the kind of plans you’ll be glad you made.</p>
          <div className="ticket-hero-stamp" aria-hidden>
            <span>
              CURATED
              <br />
              FOR YOU
            </span>
            ✳
          </div>
        </section>
        <section className="ticket-content">
          <div className="ticket-section-title">
            <div>
              <span className="ticket-eyebrow">OUT THERE, SOON</span>
              <h2>Good things happening</h2>
            </div>
            <span>{events.length} EVENTS · NOVEMBER 2026</span>
          </div>
          <div className="ticket-events">
            {events.map((event) => (
              <button
                type="button"
                key={event.id}
                onClick={() => {
                  setSelected(event);
                  setQuantity(1);
                }}
                className={`ticket-event ${selected.id === event.id ? 'is-selected' : ''}`}
                aria-pressed={selected.id === event.id}
              >
                <span
                  className="ticket-event-photo"
                  style={{
                    backgroundImage: `linear-gradient(0deg,#10283188,transparent 60%),url(https://images.unsplash.com/${event.image}?auto=format&fit=crop&w=720&q=80)`,
                  }}
                >
                  <span>{selected.id === event.id ? 'SELECTED' : 'VIEW EVENT'}</span>
                </span>
                <span className="ticket-event-copy">
                  <span className="ticket-event-type">{event.type}</span>
                  <span className="ticket-event-name">{event.name}</span>
                  <span className="ticket-event-meta">
                    <CalendarDays size={15} aria-hidden />
                    {event.date}
                  </span>
                  <span className="ticket-event-meta">
                    <MapPin size={15} aria-hidden />
                    {event.place}
                  </span>
                  <strong>
                    From {money(event.price)} <small>/ person</small>
                  </strong>
                </span>
              </button>
            ))}
          </div>
          <div className="ticket-checkout">
            <div>
              <span className="ticket-eyebrow">YOUR EVENING</span>
              <h2>{selected.name}</h2>
              <p>
                {selected.date} · {selected.place}
              </p>
            </div>
            <label>
              Tickets
              <select
                aria-label="Tickets"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'ticket' : 'tickets'}
                  </option>
                ))}
              </select>
            </label>
            <div className="ticket-total">
              <span>
                Total <small>· demo payment</small>
              </span>
              <strong>{money(selected.price * quantity)}</strong>
            </div>
            <button className="button" onClick={() => setTicket(true)}>
              Pay & get tickets <ArrowRight size={17} aria-hidden />
            </button>
          </div>
          <p className="ticket-footnote">
            Fictional events for this demo. No real payment details needed or collected.
          </p>
        </section>
      </main>
    </>
  );
}
