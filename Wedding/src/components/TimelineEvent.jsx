import { useEffect, useRef } from 'react';

import { fromToIf, gsap } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import EventDetails from './EventDetails.jsx';
import EventOrnament from './EventOrnament.jsx';

/**
 * One milestone on the celebration timeline.
 *
 * It renders the same celebration object Phase 04's showcase uses, so a Haldi,
 * a Mehendi or the ceremony is described once in `src/config/wedding.js`. The
 * shared details block resolves whatever has been filled in and renders nothing
 * at all while date, time and venue are still empty.
 *
 * @param {{ event: object, index: number }} props
 */
export default function TimelineEvent({ event, index }) {
  const rootRef = useRef(null);
  // From tablet up the content alternates either side of the gold spine.
  const flip = index % 2 === 1;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // Reduced motion: nothing is created and the milestone renders as designed.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const marker = find('.milestone__dot');
      const content = find('.milestone__content');
      const meta = find('.milestone__meta');
      const nameInner = find('.milestone__name-inner');
      const copy = find('.milestone__copy');
      const details = find('.milestone__details');
      const motif = find('.milestone__motif');
      const halo = find('.milestone__halo');

      // The content drifts in from the side of the spine it sits on.
      const shift = flip ? 26 : -26;

      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: root, start: revealStart(84), once: true },
        })
        .fromTo(
          marker,
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, duration: 0.7, transformOrigin: 'center' },
          0,
        )
        .fromTo(
          content,
          { opacity: 0, x: shift },
          { opacity: 1, x: 0, duration: 1.05 },
          0.1,
        )
        .fromTo(meta, { opacity: 0 }, { opacity: 1, duration: 0.7 }, 0.35)
        .fromTo(
          nameInner,
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1, ease: 'power3.out' },
          0.45,
        )
        .fromTo(
          copy,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.8,
        )
        .fromTo(
          motif,
          { opacity: 0, scale: 0.82 },
          { opacity: 1, scale: 1, duration: 1.1, transformOrigin: 'center' },
          0.3,
        );

      // The logistics block appears only once real details exist, so it is
      // added conditionally rather than chained blindly.
      fromToIf(
        tl,
        1.05,
        details,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.85 },
      );

      // Give the choreography room to be watched on a phone.
      cinematicOnPhones(tl);

      // A restrained drift on the decorative halo only — no text ever moves.
      gsap.fromTo(
        halo,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [flip]);

  return (
    <article
      className={`milestone milestone--${event.theme}${
        flip ? ' milestone--flip' : ''
      }`}
      ref={rootRef}
    >
      <div className="milestone__marker" aria-hidden="true">
        <span className="milestone__dot" />
      </div>

      <div
        className={`milestone__content glass ${
          event.theme === 'wedding' ? 'glass--panel' : 'glass--soft'
        } glass-inset`}
      >
        {event.theme === 'wedding' ? (
          <span className="glass-sheen" aria-hidden="true" />
        ) : null}

        <p className="milestone__meta">
          <span className="milestone__number">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="milestone__meta-line" aria-hidden="true" />
          <span className="milestone__label">{event.label}</span>
        </p>

        <h3 className="milestone__name">
          <span className="milestone__name-mask">
            <span className="milestone__name-inner">{event.name}</span>
          </span>
        </h3>

        <p className="milestone__copy">{event.description}</p>

        <EventDetails source={event} className="milestone__details" />
      </div>

      <div className="milestone__motif" aria-hidden="true">
        <span className="milestone__halo" />
        <EventOrnament theme={event.theme} className="milestone__ornament" />
      </div>
    </article>
  );
}
