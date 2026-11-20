import { useEffect, useRef } from 'react';

import { gsap } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import { wedding } from '../config/wedding.js';
import EventEntry from './EventEntry.jsx';
import { Divider } from './Ornaments.jsx';

/**
 * Phase 04 — the celebrations showcase.
 *
 * An editorial, left-aligned header followed by three alternating entries, so
 * the composition reads quite differently from Phase 03's centred panel. The
 * scroll stays completely native: nothing is pinned and nothing is hijacked.
 * Only the header (and the separators) get timelines here — each entry runs its
 * own as it arrives.
 *
 * The ambient environment is not touched at all: it lives in the fixed
 * backdrop, so the petals, dust and candlelight carry straight on from the
 * earlier phases. With `prefers-reduced-motion` nothing is created.
 */
export default function EventShowcase() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const meta = find('.showcase__meta');
      const line = find('.showcase__meta-line');
      const title = find('.showcase__title-inner');
      const intro = find('.showcase__intro');

      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: root, start: revealStart(82), once: true },
        })
        .fromTo(
          meta,
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.8 },
          0,
        )
        .fromTo(
          line,
          { opacity: 0, scaleX: 0.3 },
          { opacity: 1, scaleX: 1, duration: 0.9, transformOrigin: 'left center' },
          0.1,
        )
        .fromTo(
          title,
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.05, ease: 'power3.out' },
          0.3,
        )
        .fromTo(
          intro,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.7,
        );

      cinematicOnPhones(tl);

      // The ornamental separators draw themselves in as they arrive.
      find('.showcase__separator').forEach((separator) => {
        gsap.fromTo(
          separator,
          { opacity: 0, scaleX: 0.45 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.9,
            ease: 'power2.out',
            transformOrigin: 'center',
            scrollTrigger: { trigger: separator, start: revealStart(88), once: true },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const { celebrations } = wedding;

  return (
    <section className="showcase" ref={rootRef} aria-labelledby="showcase-title">
      <header className="showcase__header">
        <p className="showcase__meta">
          <span className="showcase__label">{celebrations.label}</span>
          <span className="showcase__meta-line" aria-hidden="true" />
        </p>

        <h2 className="showcase__title" id="showcase-title">
          <span className="showcase__title-mask">
            <span className="showcase__title-inner">
              {celebrations.title}
            </span>
          </span>
        </h2>

        <p className="showcase__intro">{celebrations.intro}</p>
      </header>

      <ol className="showcase__events">
        {celebrations.events.map((event, index) => (
          <li className="showcase__item" key={event.id}>
            {index > 0 && <Divider className="showcase__separator" />}
            <EventEntry event={event} index={index} />
          </li>
        ))}
      </ol>
    </section>
  );
}
