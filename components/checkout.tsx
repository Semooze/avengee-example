'use client';
import { useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { hotels, money, priceFor, type Booking } from '@avengee/domain';
import { ArrowLeft, Check, ShieldCheck, CalendarDays, Users, Info } from 'lucide-react';
import { api, friendlyDate, rememberBooking } from '@/lib/client';
export default function Checkout() {
  const params = useSearchParams();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const idempotencyKey = useRef<string | null>(null);
  const hotel = hotels.find((h) => h.id === params?.get('hotelId'));
  const room = hotel?.rooms.find((r) => r.id === params?.get('roomId'));
  const checkIn = params?.get('checkIn') || '';
  const checkOut = params?.get('checkOut') || '';
  const guests = Number(params?.get('guests'));
  if (
    !hotel ||
    !room ||
    !Number.isFinite(Date.parse(checkIn)) ||
    !Number.isFinite(Date.parse(checkOut)) ||
    checkOut <= checkIn ||
    !Number.isInteger(guests) ||
    guests < 1 ||
    guests > room.capacity
  )
    return (
      <main className="empty-page">
        <h1>Let’s find your room first.</h1>
        <p>Choose your dates and a room before making a reservation.</p>
        <Link className="button" href="/stays">
          Explore stays
        </Link>
      </main>
    );
  const price = priceFor(room, checkIn, checkOut);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const booking = await api<Booking & { token: string }>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          hotelId: hotel!.id,
          roomId: room!.id,
          checkIn,
          checkOut,
          guests,
          firstName: form.get('firstName'),
          lastName: form.get('lastName'),
          email: form.get('email'),
          idempotencyKey: idempotencyKey.current,
        }),
      });
      rememberBooking(booking);
      router.push(
        `/stays/bookings?id=${encodeURIComponent(booking.id)}#token=${booking.token}&new=1`,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'We couldn’t complete your booking. Please try again.',
      );
      setBusy(false);
    }
  }
  return (
    <main className="shell checkout-page">
      <Link className="back-link" href={`/stays/${hotel.id}?${params}`}>
        <ArrowLeft size={15} /> Back to your room
      </Link>
      <div className="checkout-heading">
        <span className="kicker">You’re a few details away</span>
        <h1>Make a little time for yourself.</h1>
        <p>Your next chapter starts here.</p>
      </div>
      <div className="checkout-grid">
        <form onSubmit={submit} className="checkout-form">
          <div className="checkout-step">
            <span>1</span>
            <h2>Your details</h2>
          </div>
          <p>Who’s joining us? Use sample details for this demo.</p>
          <div className="form-grid">
            <label>
              First name
              <input name="firstName" autoComplete="given-name" required maxLength={80} />
            </label>
            <label>
              Last name
              <input name="lastName" autoComplete="family-name" required maxLength={80} />
            </label>
            <label className="full-width">
              Email address
              <input name="email" type="email" autoComplete="email" required maxLength={254} />
              <small>For your booking details. This demo does not send emails.</small>
            </label>
          </div>
          <div className="checkout-step">
            <span>2</span>
            <h2>Review and confirm</h2>
          </div>
          <div className="demo-payment">
            <ShieldCheck size={25} />
            <div>
              <h3>All the experience. None of the charges.</h3>
              <p>
                This is a simulated checkout. No payment details are needed and no real room is
                reserved.
              </p>
            </div>
          </div>
          <label className="check-label consent">
            <input type="checkbox" required /> I understand this is a demo booking
          </label>
          <p className="privacy-note">
            Your booking access is saved in this browser. On a shared device, keep your access code
            private.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button confirm-button" disabled={busy}>
            {busy ? 'Confirming your stay…' : 'Confirm demo booking'}
            <Check size={18} />
          </button>
          <p className="secure-note">
            <ShieldCheck size={14} /> Free cancellation · No payment collected
          </p>
        </form>
        <aside className="booking-summary">
          <img src={hotel.image} alt={hotel.name} />
          <div className="summary-content">
            <span className="kicker">Your little escape</span>
            <h2>{hotel.name}</h2>
            <p>
              {room.name} · {hotel.destination}
            </p>
            <div className="summary-dates">
              <CalendarDays size={18} />
              <div>
                <strong>
                  {friendlyDate(checkIn)} – {friendlyDate(checkOut)}
                </strong>
                <span>{price.nights} nights</span>
              </div>
            </div>
            <div className="summary-guests">
              <Users size={18} />
              {guests} {guests === 1 ? 'guest' : 'guests'} · 1 room
            </div>
            <div className="price-breakdown">
              <div>
                <span>
                  {money(room.price)} × {price.nights} nights
                </span>
                <span>{money(price.subtotal)}</span>
              </div>
              <div>
                <span>Taxes & fees (10%)</span>
                <span>{money(price.tax)}</span>
              </div>
              <div className="total">
                <strong>
                  Total <small>THB</small>
                </strong>
                <strong>{money(price.total)}</strong>
              </div>
            </div>
            <p className="summary-note">
              <Info size={15} /> Final price is verified when you book.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
