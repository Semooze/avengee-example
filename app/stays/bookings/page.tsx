import { Suspense } from 'react';
import BookingsView from '@/components/bookings-view';
export const metadata = { title: 'Your bookings' };
export default function BookingsPage() {
  return (
    <Suspense fallback={<main className="empty-page">Opening your bookings…</main>}>
      <BookingsView />
    </Suspense>
  );
}
