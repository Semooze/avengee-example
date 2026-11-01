'use client';
import { useEffect, useState } from 'react';
import { destinations, dateAfter } from '@avengee/domain';
import { MapPin, CalendarDays, Users, Search } from 'lucide-react';
export interface StaySearch {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
}
export function initialSearch(params?: URLSearchParams): StaySearch {
  return {
    destination: params?.get('destination') || '',
    checkIn: params?.get('checkIn') || dateAfter(7),
    checkOut: params?.get('checkOut') || dateAfter(10),
    guests: params?.get('guests') || '2',
  };
}
export default function SearchForm({
  initial,
  onSearch,
  compact = false,
}: {
  initial: StaySearch;
  onSearch: (value: StaySearch) => void;
  compact?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  useEffect(() => {
    setValue(initial);
    setError('');
  }, [initial.destination, initial.checkIn, initial.checkOut, initial.guests]);
  const update = (key: keyof StaySearch, next: string) =>
    setValue((old) => ({ ...old, [key]: next }));
  return (
    <form
      className={`search-form ${compact ? 'compact' : ''}`}
      onSubmit={(event) => {
        event.preventDefault();
        const nights = (Date.parse(value.checkOut) - Date.parse(value.checkIn)) / 86400000;
        if (nights < 1 || nights > 30) {
          setError('Choose a stay between 1 and 30 nights.');
          return;
        }
        setError('');
        onSearch(value);
      }}
    >
      <div className="search-fields">
        <label>
          <span>
            <MapPin size={15} /> Destination
          </span>
          <select
            aria-label="Destination"
            value={value.destination}
            onChange={(e) => update('destination', e.target.value)}
          >
            <option value="">Anywhere in Thailand</option>
            {destinations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          <span>
            <CalendarDays size={15} /> Check-in
          </span>
          <input
            aria-label="Check-in"
            type="date"
            required
            min={dateAfter(0)}
            max={dateAfter(365)}
            value={value.checkIn}
            onChange={(e) => update('checkIn', e.target.value)}
          />
        </label>
        <label>
          <span>
            <CalendarDays size={15} /> Check-out
          </span>
          <input
            aria-label="Check-out"
            type="date"
            required
            min={value.checkIn}
            max={dateAfter(395)}
            value={value.checkOut}
            onChange={(e) => update('checkOut', e.target.value)}
          />
        </label>
        <label>
          <span>
            <Users size={15} /> Guests
          </span>
          <select
            aria-label="Guests"
            value={value.guests}
            onChange={(e) => update('guests', e.target.value)}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="submit">
          <Search size={18} />
          {compact ? 'Update search' : 'Find my stay'}
        </button>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
