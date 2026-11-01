import { Suspense } from 'react';
import Checkout from '@/components/checkout';
export const metadata = { title: 'Complete your demo booking' };
export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="empty-page">Preparing your stay…</main>}>
      <Checkout />
    </Suspense>
  );
}
