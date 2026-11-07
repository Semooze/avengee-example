import Link from 'next/link';
import { AvengeeLogo } from '@/components/avengee-logo';
export default function NotFound() {
  return (
    <main className="empty-page status-page">
      <AvengeeLogo />
      <p className="kicker" lang="en">
        A little off the map
      </p>
      <h1 lang="en">We couldn’t find that page.</h1>
      <p lang="en">Let’s get you back to somewhere good.</p>
      <p className="status-page-th">ไม่พบหน้าที่คุณกำลังหา</p>
      <Link className="button" href="/">
        Back to the gallery
      </Link>
    </main>
  );
}
