import { Suspense } from 'react';
import StayExplorer from '@/components/stay-explorer';
export const metadata = { title: 'Serein — Thoughtful stays' };
export default function StaysPage() {
  return (
    <Suspense fallback={<main className="empty-page">Finding your next escape…</main>}>
      <StayExplorer />
    </Suspense>
  );
}
