import { useEffect, useRef, useState } from 'react';
import { Pause, Play, X } from 'lucide-react';

import { AUTO_SCROLL_DELAY, AUTO_SCROLL_SPEED_PHONE, createAutoScroller } from '../lib/autoScroll.js';
import { isCompactViewport } from '../lib/reveal.js';

const LABELS = {
  playing: 'Auto playing',
  resuming: 'Resuming',
  paused: 'Paused',
  finished: 'Journey complete',
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The cinematic camera.
 *
 * Once the invitation is open, the page begins to travel down the invitation on
 * its own at a constant pace. The guest always has control: any wheel, touch,
 * key or pointer input pauses it, a focused form field holds it, and it only
 * picks up again after ten quiet seconds from wherever the guest left the page.
 *
 * The capsule in the corner reports the state and can stop the camera for this
 * visit. With `prefers-reduced-motion` nothing starts and no capsule appears.
 *
 * @param {{ isOpen: boolean }} props
 */
export default function AutoScrollController({ isOpen }) {
  const [status, setStatus] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [still] = useState(prefersReducedMotion);
  const scrollerRef = useRef(null);

  const active = enabled && !still && isOpen;

  useEffect(() => {
    if (!active) return undefined;

    const scroller = createAutoScroller({
      // A phone travels a touch slower, so the reveals can be watched.
      speed: isCompactViewport() ? AUTO_SCROLL_SPEED_PHONE : undefined,
      onStatus: setStatus,
    });
    scrollerRef.current = scroller;

    // Let the opening transition settle before the camera starts moving.
    const startTimer = window.setTimeout(
      () => scroller.start(),
      AUTO_SCROLL_DELAY,
    );

    return () => {
      window.clearTimeout(startTimer);
      scroller.destroy();
      scrollerRef.current = null;
      setStatus(null);
    };
  }, [active]);

  // Once the journey is complete, let the capsule leave quietly.
  useEffect(() => {
    if (status !== 'finished') return undefined;
    const timer = window.setTimeout(() => setStatus(null), 6000);
    return () => window.clearTimeout(timer);
  }, [status]);

  if (!active || status === null) return null;

  const moving = status === 'playing' || status === 'resuming';

  return (
    <div className="auto-scroll">
      <span
        className={`auto-scroll__dot${moving ? ' is-live' : ''}`}
        aria-hidden="true"
      />

      <span className="auto-scroll__label" role="status" aria-live="polite">
        {LABELS[status] ?? ''}
      </span>

      {status !== 'finished' ? (
        <button
          className="auto-scroll__btn"
          type="button"
          onClick={() => scrollerRef.current?.toggle()}
          aria-label={
            moving ? 'Pause automatic scrolling' : 'Resume automatic scrolling'
          }
          title={
            moving ? 'Pause automatic scrolling' : 'Resume automatic scrolling'
          }
        >
          {moving ? (
            <Pause size={11} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Play size={11} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      ) : null}

      <button
        className="auto-scroll__btn"
        type="button"
        onClick={() => setEnabled(false)}
        aria-label="Stop automatic scrolling for this visit"
        title="Stop automatic scrolling for this visit"
      >
        <X size={11} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}
