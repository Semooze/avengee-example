import Link from 'next/link';

export function AvengeeLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`avengee-logo ${className}`.trim()} aria-label="Avengee home">
      <span className="brand-symbol" aria-hidden>
        a
      </span>
      <span aria-hidden>
        avengee<span className="logo-dot">.</span>
      </span>
    </Link>
  );
}
