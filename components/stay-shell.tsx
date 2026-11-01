import Link from 'next/link';
import { ArrowUpLeft, Waves } from 'lucide-react';
export function StayHeader() {
  return (
    <>
      <div className="demo-bar">
        <span>An Avengee demo · Fictional stays, real attention to detail</span>
        <Link href="/">
          Back to gallery <ArrowUpLeft size={13} />
        </Link>
      </div>
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
          <Waves size={26} />
          <p>Made for the way you want to feel.</p>
        </div>
        <div>
          <Link href="/">
            An experience by Avengee <ArrowUpLeft size={14} />
          </Link>
          <p>Demo only. No real reservations or charges.</p>
        </div>
      </div>
    </footer>
  );
}
