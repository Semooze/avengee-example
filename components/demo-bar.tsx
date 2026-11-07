import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type DemoBarProps = {
  name: string;
  kind: string;
  next?: { href: string; name: string };
};

/** Shared Avengee frame shown above every client-style demo. */
export function DemoBar({ name, kind, next }: DemoBarProps) {
  return (
    <div className="demo-bar" role="region" aria-label="Avengee demo" lang="th">
      <Link href="/" className="demo-bar-brand" aria-label="Avengee home">
        <span className="brand-symbol" aria-hidden>
          a
        </span>
        <span aria-hidden>avengee.</span>
      </Link>
      <span className="demo-bar-label" lang="en">
        <span className="demo-bar-dot" aria-hidden /> Live demo · {name}
        <span className="demo-bar-kind"> — {kind}</span>
      </span>
      <nav className="demo-bar-actions" aria-label="Demo navigation">
        <Link href="/#projects" className="demo-bar-link">
          <ArrowLeft size={14} aria-hidden /> <span>ดูผลงานทั้งหมด</span>
          <span className="demo-bar-en" lang="en">
            {' '}
            · All projects
          </span>
        </Link>
        {next && (
          <Link
            href={next.href}
            className="demo-bar-link demo-bar-next"
            aria-label={`Next demo: ${next.name}`}
          >
            <span className="demo-bar-next-text" lang="en">
              Next · {next.name}
            </span>
            <ArrowRight size={14} aria-hidden />
          </Link>
        )}
      </nav>
    </div>
  );
}
