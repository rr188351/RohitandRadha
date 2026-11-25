import { useEffect, useRef } from 'react';

import { fromToIf, gsap } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import {
  attachCardHover,
  cardTo,
  sideCardFrom,
} from '../lib/motion.js';
import EventDetails from './EventDetails.jsx';
import EventOrnament from './EventOrnament.jsx';
import CardOrnament from './CardOrnament.jsx';
import GoldFrame from './GoldFrame.jsx';
import { CornerOrnament } from './Ornaments.jsx';

const CORNERS = ['tl', 'tr', 'br', 'bl'];

/** Phase 22D — each celebration carries its own background ground. */
const PATTERN = {
  haldi: 'diagonal',
  mehendi: 'bloom',
  wedding: 'mandala',
};

/**
 * One editorial celebration entry.
 *
 * Entries alternate side to side down the page (`flip`), the title arrives
 * through a mask, and the theme tints both the motif and its halo. The reveal
 * is a single `once` ScrollTrigger, so it plays once as the entry scrolls in and
 * never replays when the visitor scrolls back and forth.
 *
 * @param {{ event: object, index: number }} props
 */
export default function EventEntry({ event, index }) {
  const rootRef = useRef(null);
  const flip = index % 2 === 1;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // Reduced motion: nothing is created and the entry renders as designed.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let detachHover = () => {};

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const frame = find('.event__frame');
      const corners = find('.event__corners .corner__art');
      const art = find('.event__art');
      const glow = find('.event__glow');
      const meta = find('.event__meta');
      const nameInner = find('.event__name-inner');
      const copy = find('.event__copy');
      const details = find('.event__details');
      const text = find('.event__text');

      // The meta row drifts in from the side the entry leans towards.
      const shift = flip ? 20 : -20;

      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: root, start: revealStart(84), once: true },
        })
        .fromTo(
          art,
          { opacity: 0, scale: 0.82 },
          { opacity: 1, scale: 1, duration: 1.15, transformOrigin: 'center' },
          0,
        )
        .fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0)
        .fromTo(
          meta,
          { opacity: 0, x: shift },
          { opacity: 1, x: 0, duration: 0.8 },
          0.2,
        )
        .fromTo(
          nameInner,
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.05, ease: 'power3.out' },
          0.35,
        )
        .fromTo(
          copy,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.75,
        );

      // Only the wedding ceremony carries a glass frame (with its corner
      // ornaments), and the logistics block appears only once real details
      // exist — both are optional, so they are added only when present.
      //
      // The panel arrives first, leaning in from the side it belongs to, and
      // its words follow inside it. The ceremony's frame rides along with the
      // text so the two never drift apart.
      const lean = flip ? 'right' : 'left';
      fromToIf(tl, 0, text, sideCardFrom(lean), cardTo({ duration: 1.2 }));
      fromToIf(tl, 0, frame, sideCardFrom(lean), cardTo({ duration: 1.2 }));
      fromToIf(
        tl,
        0.1,
        corners,
        { opacity: 0, scale: 0.74 },
        {
          opacity: 0.5,
          scale: 1,
          duration: 1,
          stagger: 0.06,
          transformOrigin: 'center',
        },
      );
      fromToIf(
        tl,
        1.05,
        details,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.85 },
      );

      // Give the choreography room to be watched on a phone.
      cinematicOnPhones(tl);

      // The whole entry is one object: resting on it lifts the glass and its
      // words together, on desktop pointers only.
      detachHover = attachCardHover(root, [...text, ...frame]);

      // A whisper of depth on the decorative halo only, so no text ever moves.
      gsap.fromTo(
        glow,
        { yPercent: -9 },
        {
          yPercent: 9,
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

    return () => {
      detachHover();
      ctx.revert();
    };
  }, [flip]);

  return (
    <article
      className={`event event--${event.theme}${flip ? ' event--flip' : ''}${
        event.frame ? ' event--framed' : ''
      }`}
      ref={rootRef}
    >
      {event.frame && (
        <>
          <span
            className="event__frame glass glass--panel glass-inset"
            aria-hidden="true"
          >
            <span className="glass-sheen" />
            <CardOrnament kind="scallop" />
            <CardOrnament kind="arch" />
            <GoldFrame tone="rich" sweep />
          </span>
          <div className="event__corners" aria-hidden="true">
            {CORNERS.map((position) => (
              <CornerOrnament
                key={position}
                position={position}
                className="event__corner"
              />
            ))}
          </div>
        </>
      )}

      <div className="event__art" aria-hidden="true">
        <span className="event__glow" />
        <EventOrnament theme={event.theme} className="event__motif" />
      </div>

      <div
        className={`event__text${
          event.frame ? '' : ' glass glass--soft glass-inset'
        }`}
      >
        {event.frame ? null : <GoldFrame />}
        {event.frame ? null : <CardOrnament kind={PATTERN[event.theme] || 'diagonal'} />}
        <p className="event__meta">
          <span className="event__number">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="event__meta-line" aria-hidden="true" />
          <span className="event__label">{event.label}</span>
        </p>

        <h3 className="event__name">
          <span className="event__name-mask">
            <span className="event__name-inner">{event.name}</span>
          </span>
        </h3>

        <p className="event__copy">{event.description}</p>

        <EventDetails source={event} className="event__details" />
      </div>
    </article>
  );
}
