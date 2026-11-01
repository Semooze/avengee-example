import type { Booking } from '@avengee/domain';
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const data = await response
    .json()
    .catch(() => ({ message: 'The service could not be reached. Please try again.' }));
  if (!response.ok)
    throw new Error(
      Array.isArray(data.message) ? data.message[0] : data.message || 'Please try again.',
    );
  return data as T;
}
export interface SavedBooking {
  id: string;
  token: string;
}
const storageKey = 'serein-bookings';
export function savedBookings(): SavedBooking[] {
  try {
    const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(items)
      ? items.filter((item) => typeof item.id === 'string' && typeof item.token === 'string')
      : [];
  } catch {
    return [];
  }
}
export function rememberBooking(booking: Booking & { token: string }) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        { id: booking.id, token: booking.token },
        ...savedBookings().filter((b) => b.id !== booking.id),
      ]),
    );
    return true;
  } catch {
    return false;
  }
}
export function friendlyDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
