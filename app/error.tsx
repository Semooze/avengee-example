'use client';
import { AvengeeLogo } from '@/components/avengee-logo';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-page status-page">
      <AvengeeLogo />
      <h1 lang="en">Something interrupted your visit.</h1>
      <p lang="en">Please try loading this page again.</p>
      <p className="status-page-th">เกิดข้อผิดพลาดบางอย่าง ลองโหลดใหม่อีกครั้ง</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <a className="text-link" href="/">
        Return to the gallery
      </a>
    </main>
  );
}
