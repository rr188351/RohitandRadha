import { useEffect, useRef } from 'react';

import { gsap } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import { useI18n } from '../i18n/index.jsx';
import { Divider } from './Ornaments.jsx';
import TimelineEvent from './TimelineEvent.jsx';

/**
 * Phase 06 — the celebration timeline.
 *
 * An axial, editorial spine through the same three celebrations Phase 04
 * showcases: the events are read straight from `wedding.celebrations.events`,
 * so nothing is duplicated and filling in a real date, time or venue in the
 * config lights up both sections at once.
 *
 * The scroll stays completely native — nothing is pinned and nothing hijacks
 * the wheel. The gold spine draws itself as the section passes, each milestone
 * reveals once and never replays, and only the decorative halos drift.
 */
export default function WeddingTimeline() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const header = root.querySelector('.timeline__header');
      const eyebrow = find('.timeline__eyebrow');
      const rule = find('.timeline__rule');
      const titleLines = find('.timeline__title-inner');
      const intro = find('.timeline__intro');
      const list = root.querySelector('.timeline__list');
      const line = find('.timeline__line');

      // --- Header ---
      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: header, start: revealStart(84), once: true },
        })
        .fromTo(
          eyebrow,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8 },
          0,
        )
        .fromTo(
          rule,
          { opacity: 0, scaleX: 0.4 },
          { opacity: 1, scaleX: 1, duration: 0.9, transformOrigin: 'center' },
          0.1,
        )
        .fromTo(
          titleLines,
          { yPercent: 112, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.12,
            ease: 'power3.out',
          },
          0.3,
        )
        .fromTo(
          intro,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.7,
        );

      cinematicOnPhones(tl);

      // --- The gold spine draws itself down the section ---
      if (list && line.length > 0) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            transformOrigin: 'top center',
            scrollTrigger: {
              trigger: list,
              start: 'top 78%',
              end: 'bottom 72%',
              scrub: 0.7,
            },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const { wedding } = useI18n();
  const { timeline, celebrations } = wedding;

  return (
    <section className="timeline" ref={rootRef} aria-labelledby="timeline-title">
      <header className="timeline__header">
        <p className="timeline__eyebrow">{timeline.eyebrow}</p>

        <Divider className="timeline__rule" />

        <h2 className="timeline__title" id="timeline-title">
          <span className="timeline__title-mask">
            <span className="timeline__title-inner">{timeline.title}</span>
          </span>
        </h2>

        <p className="timeline__intro">{timeline.intro}</p>
      </header>

      <div className="timeline__track">
        <span className="timeline__line" aria-hidden="true" />

        <ol className="timeline__list">
          {celebrations.events.map((event, index) => (
            <li className="timeline__item" key={event.id}>
              <TimelineEvent event={event} index={index} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
