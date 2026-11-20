import { useEffect, useRef } from 'react';
import { Crown } from 'lucide-react';

import { fromToIf, gsap } from '../lib/gsap';
import { attachCardHover, cardFrom, cardTo } from '../lib/motion.js';
import { hasEventDetails, wedding } from '../config/wedding.js';
import { CornerOrnament, Divider } from './Ornaments.jsx';

const CORNERS = ['tl', 'tr', 'br', 'bl'];

/**
 * Phase 02 — the wedding hero.
 *
 * It sits above the atmospheric backdrop that `InvitationIntro` keeps mounted,
 * so the petals, dust and candlelight carry straight on across the reveal.
 *
 * The timeline begins the moment `isOpen` flips and is timed against the exit
 * timeline in `InvitationIntro` (which fades the card away over roughly the
 * first 1.4s), so the two halves read as one continuous choreography.
 * When the visitor prefers reduced motion the stylesheet swaps the screens
 * instantly instead and nothing here runs.
 */
export default function WeddingHero({ isOpen }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let detachHover = () => {};

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const bloom = find('.hero__bloom');
      const inner = find('.hero__inner');
      const corners = find('.hero__corner .corner__art');
      const crest = find('.hero__crest');
      const label = find('.hero__label');
      const rules = find('.hero__rule');
      const first = find('.hero__name--first');
      const conjunction = find('.hero__and');
      const second = find('.hero__name--second');
      const copy = find('.hero__copy');
      const details = find('.hero__details');

      const tl = gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        // The hero itself appears at once; its pieces arrive afterwards.
        .set(root, { autoAlpha: 1 }, 0)
        // A warm golden light spreads briefly across the hand-over.
        // The invitation plaque materialises along with the ambient light.
        .fromTo(
          inner,
          cardFrom({ y: 30, scale: 0.982, rotate: 0.3 }),
          cardTo({ duration: 1.4 }),
          0.5,
        )
        .fromTo(
          bloom,
          { opacity: 0, scale: 0.7 },
          { opacity: 0.85, scale: 1.15, duration: 1, ease: 'sine.out' },
          0.6,
        )
        .to(
          bloom,
          { opacity: 0, scale: 1.55, duration: 0.9, ease: 'sine.in' },
          1.55,
        )
        // Frame ornaments, crest and label settle in.
        .fromTo(
          corners,
          { opacity: 0, scale: 0.72 },
          {
            opacity: 0.5,
            scale: 1,
            duration: 1,
            stagger: 0.07,
            transformOrigin: 'center',
          },
          0.85,
        )
        .fromTo(
          crest,
          { opacity: 0, scale: 0.86 },
          { opacity: 1, scale: 1, duration: 0.9, transformOrigin: 'center' },
          0.9,
        )
        .fromTo(
          label,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8 },
          1,
        )
        .fromTo(
          rules,
          { opacity: 0, scaleX: 0.4 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.8,
            stagger: 0.9,
            transformOrigin: 'center',
          },
          1.15,
        )
        // Radha — and — Rohit, revealed in stages.
        .fromTo(
          first,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
          1.25,
        )
        .fromTo(
          conjunction,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.7, transformOrigin: 'center' },
          1.6,
        )
        .fromTo(
          second,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
          1.85,
        )
        .fromTo(
          copy,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.2 },
          2.3,
        );

      // The logistics block appears only once real details exist, so it is
      // added conditionally rather than chained blindly.
      fromToIf(
        tl,
        2.75,
        details,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9 },
      );
      // The plaque is a solid object in a lit room: it rises closer to the
      // guest when the pointer rests on it.
      detachHover = attachCardHover(inner);
    }, root);

    return () => {
      detachHover();
      ctx.revert();
    };
  }, [isOpen]);

  const { names, label, copy } = wedding;

  return (
    <section
      className="hero"
      ref={rootRef}
      aria-hidden={!isOpen}
      aria-labelledby="hero-names"
    >
      <div className="hero__bloom-clip" aria-hidden="true">
        <div className="hero__bloom" />
      </div>

      <div className="hero__corners" aria-hidden="true">
        {CORNERS.map((position) => (
          <CornerOrnament
            key={position}
            position={position}
            className="hero__corner"
          />
        ))}
      </div>

      <div className="hero__inner glass glass--panel glass-inset">
        <div className="hero__crest">
          <span className="hero__crest-line" aria-hidden="true" />
          <Crown
            className="hero__crest-icon"
            size={20}
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <span className="hero__crest-line" aria-hidden="true" />
        </div>

        <p className="hero__label">{label}</p>

        <Divider className="hero__rule" />

        <h1 className="hero__names" id="hero-names">
          {/* The explicit spaces keep the accessible name as "Radha and Rohit";
              flex layout ignores whitespace-only text nodes visually. */}
          <span className="hero__name hero__name--first">{names.first}</span>{' '}
          <span className="hero__and">and</span>{' '}
          <span className="hero__name hero__name--second">{names.second}</span>
        </h1>

        <Divider className="hero__rule" />

        <p className="hero__copy">{copy.families}</p>
        <p className="hero__copy hero__copy--secondary">{copy.invite}</p>

        {/* Rendered only once real details exist in src/config/wedding.js, so
            no placeholder text is ever shown on the designed screen. */}
        {hasEventDetails() && (
          <dl className="hero__details">
            {wedding.dateLabel && (
              <div className="hero__detail">
                <dt>The Day</dt>
                <dd>{wedding.dateLabel}</dd>
              </div>
            )}
            {wedding.timeLabel && (
              <div className="hero__detail">
                <dt>The Hour</dt>
                <dd>{wedding.timeLabel}</dd>
              </div>
            )}
            {wedding.venueName && (
              <div className="hero__detail">
                <dt>The Place</dt>
                <dd>{wedding.venueName}</dd>
              </div>
            )}
            {wedding.venueLocation && (
              <div className="hero__detail">
                <dt>Location</dt>
                <dd>{wedding.venueLocation}</dd>
              </div>
            )}
            {wedding.venueAddress && (
              <div className="hero__detail">
                <dt>Address</dt>
                <dd>{wedding.venueAddress}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </section>
  );
}
