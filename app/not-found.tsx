import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="empty-page">
      <p className="kicker">A little off the map</p>
      <h1>We couldn’t find that page.</h1>
      <p>Let’s get you back to somewhere good.</p>
      <Link className="button" href="/">
        Back to the gallery
      </Link>
    </main>
  );
}
