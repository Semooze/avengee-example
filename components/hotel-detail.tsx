'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { money, type Hotel, type Room } from '@avengee/domain';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  MapPin,
  Check,
  Users,
  BedDouble,
  Maximize,
  ShieldCheck,
  Coffee,
  Waves,
} from 'lucide-react';
import SearchForm, { initialSearch, type StaySearch } from './search-form';
import { api } from '@/lib/client';
type AvailableRoom = Room & { available: number; total: number; nights: number };
export default function HotelDetail({ hotel, query }: { hotel: Hotel; query: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(() => initialSearch(new URLSearchParams(query)));
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api<AvailableRoom[]>(`/hotels/${hotel.id}/availability?${new URLSearchParams({ ...search })}`)
      .then((value) => {
        if (active) setRooms(value);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hotel.id, search, retry]);
  function update(value: StaySearch) {
    setSearch(value);
    router.replace(`/stays/${hotel.id}?${new URLSearchParams({ ...value })}`, { scroll: false });
  }
  return (
    <main className="shell hotel-detail">
      <Link className="back-link" href={`/stays?${query}#collection`}>
        <ArrowLeft size={15} /> All stays
      </Link>
      <div className="detail-heading">
        <div>
          <span className="kicker">{hotel.category}</span>
          <h1>{hotel.name}</h1>
          <p>
            <MapPin size={15} />
            {hotel.region}, {hotel.destination}, Thailand
          </p>
        </div>
        <div className="detail-rating">
          <Star size={19} fill="currentColor" />
          <strong>{hotel.rating}</strong>
          <span>{hotel.reviews} sample reviews</span>
        </div>
      </div>
      <div className="detail-gallery">
        <img src={hotel.gallery[0]} alt={`${hotel.name} resort`} fetchPriority="high" />
        <img src={hotel.gallery[1]} alt="Comfortable suite with soft linens" />
        <img src={hotel.gallery[2]} alt="A quiet swimming pool" />
      </div>
      <div className="detail-overview">
        <div>
          <h2>{hotel.tagline}</h2>
          <p>{hotel.description}</p>
          <div className="amenities">
            {hotel.amenities.map((a) => (
              <span key={a}>
                <Check size={15} />
                {a}
              </span>
            ))}
          </div>
        </div>
        <aside className="host-note">
          <Waves size={29} strokeWidth={1.3} />
          <h3>Stay a little slower.</h3>
          <p>
            Check in from 3 pm.
            <br />
            Check out by 11 am.
            <br />
            Breakfast, and a warm welcome, included.
          </p>
          <small>Fictional property · Illustrative photography</small>
        </aside>
      </div>
      <section className="rooms-section">
        <div className="section-heading">
          <div>
            <span className="kicker">A space to make your own</span>
            <h2>Choose your room.</h2>
          </div>
          <span>
            <ShieldCheck size={16} /> Free cancellation in this demo
          </span>
        </div>
        <SearchForm initial={search} onSearch={update} compact />
        {loading && (
          <p className="loading-state" role="status">
            Checking rooms for your dates…
          </p>
        )}
        {error && (
          <div className="error-panel" role="alert">
            <h3>We couldn’t check availability.</h3>
            <p>{error}</p>
            <button className="button secondary" onClick={() => setRetry((v) => v + 1)}>
              Try again
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="room-list">
            {rooms.map((room) => (
              <article key={room.id} className="room-card">
                <img src={room.image} alt={room.name} />
                <div className="room-description">
                  <h3>{room.name}</h3>
                  <div className="room-specs">
                    <span>
                      <Users size={14} /> Up to {room.capacity}
                    </span>
                    <span>
                      <Maximize size={14} />
                      {room.size} m²
                    </span>
                    <span>
                      <BedDouble size={14} />
                      {room.bed}
                    </span>
                  </div>
                  <p>{room.description}</p>
                  <span className="room-included">
                    <Coffee size={14} /> Breakfast included
                  </span>
                </div>
                <div className="room-price">
                  <span>
                    <strong>{money(room.price)}</strong> / night
                  </span>
                  <p>
                    {money(room.total)} for {room.nights} nights
                    <br />
                    Includes 10% taxes & fees
                  </p>
                  {room.available > 0 ? (
                    <>
                      <button
                        className="button"
                        aria-label={`Reserve ${room.name}`}
                        onClick={() =>
                          router.push(
                            `/stays/checkout?${new URLSearchParams({ ...search, hotelId: hotel.id, roomId: room.id })}`,
                          )
                        }
                      >
                        Reserve room <ArrowRight size={16} />
                      </button>
                      <small>
                        {room.available === 1
                          ? 'Just one room for these dates'
                          : `${room.available} rooms for these dates`}
                      </small>
                    </>
                  ) : (
                    <>
                      <button className="button" disabled>
                        Unavailable
                      </button>
                      <small>
                        {room.capacity < Number(search.guests)
                          ? 'Choose a room for more guests'
                          : 'Try different dates'}
                      </small>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
