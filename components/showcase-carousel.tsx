'use client';

import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { showcases } from '@/components/showcase-data';

const AUTOPLAY_MS = 6000;
const total = showcases.length;

/** Desktop capture above 580px, a portrait phone capture below it. */
function ShowcaseShot({ id, alt, eager }: { id: string; alt: string; eager: boolean }) {
  const common = {
    alt,
    quality: 75,
    preload: eager,
    loading: eager ? undefined : ('lazy' as const),
  };
  const {
    props: { srcSet: desktop },
  } = getImageProps({
    ...common,
    src: `/showcase/${id}.webp`,
    width: 1440,
    height: 900,
    sizes: '(max-width: 1100px) 100vw, 1180px',
  });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    ...common,
    src: `/showcase/${id}-m.webp`,
    width: 780,
    height: 976,
    sizes: '100vw',
  });
  return (
    <picture>
      <source media="(min-width: 581px)" srcSet={desktop} />
      <source media="(max-width: 580px)" srcSet={mobile} />
      {/* eslint-disable-next-line @next/next/no-img-element -- art-directed via getImageProps */}
      <img {...rest} alt={alt} />
    </picture>
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Scroll-snap carousel of the six demos. Native scrolling gives touch swipe;
 * this component only syncs the active slide, autoplay and the controls.
 */
export function ShowcaseCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  // Slide a programmatic scroll is heading to; scroll sync ignores the slides it passes.
  const targetRef = useRef<number | null>(null);
  const settleRef = useRef(0);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Autoplay is opt-out, except for people who asked the OS for less motion.
  useEffect(() => {
    setPlaying(!prefersReducedMotion());
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (index + total) % total;
    targetRef.current = next;
    window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => (targetRef.current = null), 900);
    track.scrollTo({
      left: next * track.clientWidth,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    setActive(next);
  }, []);

  // Keep the active index in sync with swipes and native scrolling.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track.clientWidth) return;
        const index = Math.round(track.scrollLeft / track.clientWidth);
        if (targetRef.current !== null && index !== targetRef.current) return;
        targetRef.current = null;
        setActive(index);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Re-align to the active slide when the track width changes (rotation, resize).
  const activeRef = useRef(active);
  activeRef.current = active;
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !('ResizeObserver' in window)) return;
    const observer = new ResizeObserver(() => {
      track.scrollTo({ left: activeRef.current * track.clientWidth, behavior: 'auto' });
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const paused = !playing || hovered || focused;
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') goTo(active + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, active, goTo]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const keys: Record<string, number> = {
      ArrowLeft: active - 1,
      ArrowRight: active + 1,
      Home: 0,
      End: total - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    goTo(keys[event.key]);
  };

  return (
    <section
      className="showcase"
      aria-roledescription="carousel"
      aria-label="ผลงานทั้ง 6 ชิ้น · Live demos"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="showcase-toolbar">
        <p className="showcase-counter" aria-hidden>
          <b>{String(active + 1).padStart(2, '0')}</b> / {String(total).padStart(2, '0')}
        </p>
        <div className="showcase-buttons">
          <button
            type="button"
            className="showcase-control"
            aria-label={playing ? 'Pause autoplay' : 'Start autoplay'}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          </button>
          <button
            type="button"
            className="showcase-control"
            aria-label="Previous project"
            aria-controls="showcase-track"
            onClick={() => goTo(active - 1)}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            className="showcase-control"
            aria-label="Next project"
            aria-controls="showcase-track"
            onClick={() => goTo(active + 1)}
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>
      <div
        className="showcase-track"
        id="showcase-track"
        ref={trackRef}
        aria-live={paused ? 'polite' : 'off'}
      >
        {showcases.map((item, index) => (
          <div
            className="showcase-slide"
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${total}: ${item.name}`}
            inert={index !== active}
          >
            <Link href={item.href} className="showcase-frame" tabIndex={-1} aria-hidden>
              <span className="showcase-chrome">
                <i />
                <i />
                <i />
                <span>avengee.app{item.href}</span>
              </span>
              <ShowcaseShot id={item.id} alt={item.alt} eager={index === 0} />
            </Link>
            <div className="showcase-caption">
              <div className="showcase-meta">
                <span className="live-pill" lang="en">
                  <span aria-hidden /> Live demo
                </span>
                <span>
                  {item.category} <span lang="en">· {item.kind}</span>
                </span>
              </div>
              <h3>
                <span lang="en">{item.name}</span> {item.title}
              </h3>
              <p>{item.text}</p>
              <Link href={item.href} className="button showcase-cta">
                {item.cta} <span className="en">{item.ctaEn}</span>
                <ArrowUpRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="showcase-thumbs" role="group" aria-label="เลือกผลงาน · Choose a project">
        {showcases.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className="showcase-thumb"
            aria-label={`Show slide ${index + 1} of ${total}: ${item.name}`}
            aria-current={index === active ? 'true' : undefined}
            aria-controls="showcase-track"
            onClick={() => goTo(index)}
          >
            <Image src={`/showcase/${item.id}.webp`} alt="" width={160} height={100} />
            <span lang="en">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
