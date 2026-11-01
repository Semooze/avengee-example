'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { hotels, money, photo } from '@avengee/domain';
import {
  ArrowUpRight,
  MapPin,
  Star,
  SlidersHorizontal,
  Waves,
  Heart,
  Coffee,
  ShieldCheck,
  X,
} from 'lucide-react';
import SearchForm, { initialSearch, type StaySearch } from './search-form';
export default function StayExplorer() {
  const params = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(() =>
    initialSearch(new URLSearchParams(params?.toString() ?? '')),
  );
  const query = params?.toString() ?? '';
  useEffect(() => {
    setSearch(initialSearch(new URLSearchParams(query)));
  }, [query]);
  const [category, setCategory] = useState('All stays');
  const [sort, setSort] = useState('recommended');
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [pool, setPool] = useState(false);
  const filtered = hotels
    .filter(
      (h) =>
        (!search.destination || h.destination === search.destination) &&
        (category === 'All stays' || h.category === category) &&
        (!pool || h.amenities.includes('Pool')) &&
        h.rooms.some((r) => r.capacity >= Number(search.guests) && r.price <= maxPrice),
    )
    .sort((a, b) =>
      sort === 'price'
        ? a.rooms[0].price - b.rooms[0].price
        : sort === 'rating'
          ? b.rating - a.rating
          : 0,
    );
  function onSearch(value: StaySearch) {
    setSearch(value);
    router.replace(`/stays?${new URLSearchParams({ ...value })}#collection`, { scroll: false });
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <main>
      <section className="stay-hero">
        <img
          className="hero-image"
          src={photo('photo-1571896349842-33c89424de2d', 2200)}
          alt="A tranquil palm-lined pool by the sea"
          fetchPriority="high"
        />
        <div className="hero-overlay" />
        <div className="shell hero-content">
          <span className="hero-note">
            <span /> A collection of places worth finding
          </span>
          <h1>
            Somewhere you’d
            <br />
            rather be.
          </h1>
          <p>
            Beautiful little escapes. Thoughtfully picked.
            <br />
            Find a stay that feels like you.
          </p>
          <div className="hero-location">
            <MapPin size={14} /> A slower kind of stay, in Thailand
          </div>
        </div>
      </section>
      <div className="shell search-wrap">
        <SearchForm initial={search} onSearch={onSearch} />
      </div>
      <div className="shell trust-strip">
        <span>
          <Heart size={17} /> Small stays, big on character
        </span>
        <span>
          <Coffee size={17} /> Breakfast always included
        </span>
        <span>
          <ShieldCheck size={17} /> Free demo cancellation
        </span>
      </div>
      <section className="shell collection" id="collection">
        <div className="collection-heading">
          <div>
            <span className="kicker">Your next change of scenery</span>
            <h2>Find your kind of somewhere.</h2>
            <p>From barefoot mornings to mountain air, a place for every pace.</p>
          </div>
          <span className="collection-mark">
            <Waves size={42} strokeWidth={1} />
          </span>
        </div>
        <div className="filter-bar">
          <div className="category-tabs">
            {[
              'All stays',
              'Beachfront',
              'Nature retreat',
              'Island escape',
              'City hideaway',
              'Design stay',
            ].map((c) => (
              <button
                key={c}
                className={category === c ? 'active' : ''}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            className={`filter-button ${filterOpen ? 'active' : ''}`}
            onClick={() => setFilterOpen(!filterOpen)}
            aria-expanded={filterOpen}
          >
            <SlidersHorizontal size={16} />
            Filters{(pool || maxPrice < 10000) && <span className="filter-dot" />}
          </button>
        </div>
        {filterOpen && (
          <div className="filter-panel">
            <label>
              Maximum per night: <strong>{money(maxPrice)}</strong>
              <input
                aria-label="Maximum price per night"
                type="range"
                min="2000"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </label>
            <label className="check-label">
              <input type="checkbox" checked={pool} onChange={(e) => setPool(e.target.checked)} />{' '}
              Swimming pool
            </label>
            <button
              className="text-link"
              onClick={() => {
                setMaxPrice(10000);
                setPool(false);
              }}
            >
              Reset filters <X size={14} />
            </button>
          </div>
        )}
        <div className="results-meta">
          <p>
            <strong>{filtered.length} considered stays</strong>
            {search.destination ? ` in ${search.destination}` : ' across Thailand'}
            <span> · Check room availability for your dates</span>
          </p>
          <label>
            Sort by{' '}
            <select aria-label="Sort stays" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Our favorites</option>
              <option value="price">Price: low to high</option>
              <option value="rating">Guest rating</option>
            </select>
          </label>
        </div>
        <div className="hotel-grid">
          {filtered.map((hotel) => (
            <Link
              href={`/stays/${hotel.id}?${new URLSearchParams({ ...search })}`}
              key={hotel.id}
              className="hotel-card"
              aria-label={`Discover ${hotel.name}`}
            >
              <div className="hotel-card-image">
                <img src={hotel.image} alt={`${hotel.name}, ${hotel.destination}`} loading="lazy" />
                <span className="hotel-category">{hotel.category}</span>
                <span className="hotel-card-arrow">
                  <ArrowUpRight size={19} />
                </span>
              </div>
              <div className="hotel-card-info">
                <div className="hotel-location">
                  <span>
                    <MapPin size={13} />
                    {hotel.destination} · {hotel.region}
                  </span>
                  <span className="rating">
                    <Star size={12} fill="currentColor" />
                    {hotel.rating}
                  </span>
                </div>
                <h3>{hotel.name}</h3>
                <p>{hotel.tagline}</p>
                <div className="hotel-card-bottom">
                  <span>
                    From{' '}
                    <strong>
                      {money(
                        Math.min(
                          ...hotel.rooms
                            .filter((r) => r.capacity >= Number(search.guests))
                            .map((r) => r.price),
                        ),
                      )}
                    </strong>{' '}
                    / night
                  </span>
                  <span>Breakfast included</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {!filtered.length && (
          <div className="empty-state">
            <Waves size={38} />
            <h3>A different kind of escape?</h3>
            <p>No stays match these filters. Try another destination or a higher nightly budget.</p>
            <button
              className="button secondary"
              onClick={() => {
                setCategory('All stays');
                setPool(false);
                setMaxPrice(10000);
                setSearch(initialSearch());
                router.replace('/stays');
              }}
            >
              Show all stays
            </button>
          </div>
        )}
        <div className="collection-note">
          <span>✳</span>
          <p>
            Not more places. The right places.
            <br />
            <strong>Every stay in our collection has a little something special.</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
