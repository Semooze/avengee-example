'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-page">
      <h1>Something interrupted your visit.</h1>
      <p>Please try loading this page again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <a className="text-link" href="/">
        Return to the gallery
      </a>
    </main>
  );
}
