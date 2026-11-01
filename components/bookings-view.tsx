'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { hotels, money, type Booking } from '@avengee/domain';
import { Check, CalendarDays, Copy, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { api, friendlyDate, rememberBooking, savedBookings, type SavedBooking } from '@/lib/client';
type AccessibleBooking = Booking & { token: string };
export default function BookingsView() {
  const params = useSearchParams();
  const [bookings, setBookings] = useState<AccessibleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBooking, setNewBooking] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    let active = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const id = params?.get('id');
    const token = hash.get('token');
    let saved = savedBookings();
    setNewBooking(false);
    if (id && token) {
      saved = [{ id, token }, ...saved.filter((b) => b.id !== id)];
    }
    setLoading(true);
    setError('');
    Promise.allSettled(
      saved.map(async (entry: SavedBooking) => ({
        ...(await api<Booking>(`/bookings/${encodeURIComponent(entry.id)}`, {
          headers: { Authorization: `Bearer ${entry.token}` },
        })),
        token: entry.token,
      })),
    ).then((results) => {
      if (!active) return;
      const found = results
        .filter((r): r is PromiseFulfilledResult<AccessibleBooking> => r.status === 'fulfilled')
        .map((r) => r.value);
      setBookings(found);
      if (results.some((r) => r.status === 'rejected'))
        setError('Some bookings could not be loaded. Check your access details or try again.');
      if (id && token) {
        const current = found.find((b) => b.id === id);
        setNewBooking(hash.get('new') === '1' && current?.status === 'confirmed');
        if (current && !rememberBooking(current)) setStorageWarning(true);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [params, refresh]);
  async function cancel(booking: AccessibleBooking) {
    setBusy(true);
    setError('');
    try {
      const updated = await api<Booking>(`/bookings/${booking.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${booking.token}` },
      });
      setBookings((old) =>
        old.map((b) => (b.id === booking.id ? { ...updated, token: b.token } : b)),
      );
      setConfirmCancel('');
      setNewBooking(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancellation failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function copy(booking: AccessibleBooking) {
    const text = `${window.location.origin}/stays/bookings?id=${booking.id}#token=${booking.token}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(booking.id);
    } catch {
      setError(
        'Copy is unavailable in this browser. Save the reference and access code shown below.',
      );
    }
  }
  return (
    <main className="shell bookings-page">
      <div className="bookings-heading">
        {newBooking && (
          <span className="success-symbol">
            <Check size={28} />
          </span>
        )}
        <span className="kicker">
          {newBooking ? 'A little escape, all yours' : 'Your travel notebook'}
        </span>
        <h1>{newBooking ? 'Your slower days are booked.' : 'Good things to look forward to.'}</h1>
        <p>
          {newBooking
            ? 'Your demo reservation is confirmed. No payment has been taken.'
            : 'Your saved reservations, all in one place.'}
        </p>
      </div>
      {loading && (
        <p className="loading-state" role="status">
          Opening your travel notebook…
        </p>
      )}
      {error && (
        <div className="error-panel" role="alert">
          <p>{error}</p>
          <button className="text-link" onClick={() => setRefresh((v) => v + 1)}>
            Try again
          </button>
        </div>
      )}
      {storageWarning && (
        <p className="form-error">
          Your browser could not save this booking. Copy the private booking link below before
          leaving.
        </p>
      )}
      {!loading &&
        bookings.map((booking) => (
          <article className="saved-booking" key={booking.id}>
            <img
              src={hotels.find((h) => h.id === booking.hotelId)?.image}
              alt={booking.hotelName}
            />
            <div className="saved-booking-content">
              <div className="saved-booking-top">
                <span className={`booking-status ${booking.status}`}>
                  {booking.status === 'confirmed' ? <Check size={13} /> : <X size={13} />}{' '}
                  {booking.status === 'confirmed' ? 'Confirmed' : 'Booking cancelled'}
                </span>
                <span>Demo reservation</span>
              </div>
              <h2>{booking.hotelName}</h2>
              <p>
                {booking.roomName} · {booking.guests} guests
              </p>
              <div className="saved-dates">
                <CalendarDays size={16} />
                {friendlyDate(booking.checkIn)} – {friendlyDate(booking.checkOut)}
              </div>
              <div className="saved-details">
                <div>
                  <span>Lead guest</span>
                  <strong>
                    {booking.firstName} {booking.lastName}
                  </strong>
                </div>
                <div>
                  <span>Total · No charge</span>
                  <strong>{money(booking.total)}</strong>
                </div>
              </div>
              <details className="access-details">
                <summary>Booking reference & private access code</summary>
                <p>
                  Keep these private. Anyone with this link or code can view and cancel this demo
                  booking.
                </p>
                <label>
                  Reference
                  <input value={booking.id} readOnly onFocus={(e) => e.target.select()} />
                </label>
                <label>
                  Access code
                  <input value={booking.token} readOnly onFocus={(e) => e.target.select()} />
                </label>
              </details>
              <div className="booking-actions">
                <button className="text-link" onClick={() => copy(booking)}>
                  <Copy size={15} />
                  {copied === booking.id ? 'Private link copied' : 'Copy private booking link'}
                </button>
                {booking.status === 'confirmed' && (
                  <button className="cancel-link" onClick={() => setConfirmCancel(booking.id)}>
                    Cancel reservation
                  </button>
                )}
              </div>
              {confirmCancel === booking.id && (
                <div className="cancel-confirm" role="group" aria-label="Confirm cancellation">
                  <h3>Cancel this reservation?</h3>
                  <p>Your room will become available again. There’s no cancellation fee.</p>
                  <div>
                    <button
                      className="button danger"
                      disabled={busy}
                      onClick={() => cancel(booking)}
                    >
                      {busy ? 'Cancelling…' : 'Yes, cancel booking'}
                    </button>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() => setConfirmCancel('')}
                    >
                      Keep my stay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      {!loading && !bookings.length && (
        <div className="empty-state">
          <CalendarDays size={35} />
          <h2>Your next escape is waiting.</h2>
          <p>
            Bookings made in this browser appear here. Already have a booking? Use your private link
            or enter its details below.
          </p>
          <Link className="button" href="/stays">
            Find a stay <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <details className="retrieve-booking">
        <summary>Find a booking with your reference and access code</summary>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setBusy(true);
            setError('');
            try {
              const token = String(data.get('token')).trim();
              const booking = await api<Booking>(
                `/bookings/${encodeURIComponent(String(data.get('reference')).trim())}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              if (!rememberBooking({ ...booking, token })) setStorageWarning(true);
              setBookings((old) => [
                { ...booking, token },
                ...old.filter((b) => b.id !== booking.id),
              ]);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Booking not found.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Booking reference
            <input name="reference" required placeholder="SRN-…" />
          </label>
          <label>
            Private access code
            <input name="token" required type="password" />
          </label>
          <button className="button" disabled={busy}>
            Find booking
          </button>
        </form>
      </details>
      <p className="booking-privacy">
        <ShieldCheck size={15} /> Bookings are saved to this browser. Keep your private link to
        access them on another device.
      </p>
      <Link href="/stays" className="text-link">
        There’s always somewhere else to discover <ArrowRight size={16} />
      </Link>
    </main>
  );
}
