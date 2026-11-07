import { Suspense } from 'react';
import Checkout from '@/components/checkout';
export const metadata = { title: 'Complete your demo booking' };
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="empty-page">
          <p className="loading-state" role="status">
            Preparing your stay…
          </p>
        </main>
      }
    >
      <Checkout />
    </Suspense>
  );
}
