'use client';

import { useEffect } from 'react';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Scroll and pointer wiring for the landing page. It only writes CSS custom
 * properties; every visual decision lives in globals.css.
 *
 * - `[data-scene="pin"]`: `--progress` runs 0→1 while a tall section scrolls
 *   past its sticky stage.
 * - `[data-scene="enter"]`: `--progress` runs 0→1 as the element rises from
 *   the bottom of the viewport to its upper third.
 * - `[data-reveal]`: gets `.is-visible` once, for a simple fade-up.
 * - `[data-spotlight]`: tracks the pointer in `--mx` / `--my`.
 * - `<html>` gets `--page-progress` for the nav progress bar.
 *
 * Content is complete without JS; motion CSS sits behind
 * `prefers-reduced-motion: no-preference`.
 */
export function LandingMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));

    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const scrollable = root.scrollHeight - viewport;
      root.style.setProperty(
        '--page-progress',
        scrollable > 0 ? clamp(window.scrollY / scrollable).toFixed(4) : '0',
      );
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom < -viewport || rect.top > viewport * 2) continue;
        const progress =
          scene.dataset.scene === 'pin'
            ? clamp(-rect.top / Math.max(1, rect.height - viewport))
            : clamp((viewport - rect.top) / (viewport * 0.66));
        scene.style.setProperty('--progress', progress.toFixed(4));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    const revealItems = document.querySelectorAll<HTMLElement>('[data-reveal]');
    let observer: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window && revealItems.length) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('is-visible');
            observer?.unobserve(entry.target);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );
      root.classList.add('reveal-ready');
      revealItems.forEach((item) => observer?.observe(item));
    }

    const onPointer = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-spotlight]');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      target.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
    document.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('pointermove', onPointer);
      observer?.disconnect();
      root.classList.remove('reveal-ready');
      root.style.removeProperty('--page-progress');
    };
  }, []);
  return null;
}
