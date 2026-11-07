'use client';

import { useEffect } from 'react';

/**
 * Fades `[data-reveal]` sections in as they scroll into view.
 * Content stays visible without JS, and the CSS only animates under
 * `prefers-reduced-motion: no-preference`.
 */
export function ScrollReveal() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!('IntersectionObserver' in window) || !items.length) return;
    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    root.classList.add('reveal-ready');
    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);
  return null;
}
