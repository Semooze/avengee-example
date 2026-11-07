import Link from 'next/link';
import { ArrowUpLeft, Waves } from 'lucide-react';
import { DemoBar } from '@/components/demo-bar';
export function StayHeader() {
  return (
    <>
      <DemoBar name="Serein" kind="Hotel booking" next={{ href: '/tickets', name: 'Goodtime' }} />
      <header className="stay-header shell">
        <Link href="/stays" className="serein-wordmark">
          serein<span>✳</span>
        </Link>
        <nav>
          <Link href="/stays#collection">Explore stays</Link>
          <Link href="/stays/bookings" className="booking-nav">
            My bookings
          </Link>
        </nav>
      </header>
    </>
  );
}
export function StayFooter() {
  return (
    <footer className="stay-footer">
      <div className="shell footer-inner">
        <div>
          <Link href="/stays" className="serein-wordmark">
            serein<span>✳</span>
          </Link>
          <p>Thoughtful stays. Unhurried days.</p>
        </div>
        <div>
          <Waves size={26} aria-hidden />
          <p>Made for the way you want to feel.</p>
        </div>
        <div>
          <Link href="/">
            An experience by Avengee <ArrowUpLeft size={14} aria-hidden />
          </Link>
          <p>Demo only. No real reservations or charges.</p>
        </div>
      </div>
    </footer>
  );
}
