import { useEffect, useRef } from 'react';
import { Crown } from 'lucide-react';

import { fromToIf, gsap, ScrollTrigger } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import { attachCardHover, cardFrom, cardTo } from '../lib/motion.js';
import { useI18n } from '../i18n/index.jsx';
import EventDetails from './EventDetails.jsx';
import CardOrnament from './CardOrnament.jsx';
import GoldFrame from './GoldFrame.jsx';
import { CornerOrnament, Divider } from './Ornaments.jsx';

const CORNERS = ['tl', 'tr', 'br', 'bl'];

/**
 * Phase 03 — "A Celebration of Two Souls".
 *
 * The heartfelt page that follows the hero. It is a normal flow section, so the
 * scroll stays completely native: no pinning and no hijacking. The reveals are
 * a single ScrollTrigger timeline set to play `once`, so they fire as the
 * section arrives and never replay, and the only parallax is a whisper of drift
 * on the decorative halo — the typography itself never moves.
 *
 * The ambient environment is not touched here at all: it lives in the fixed
 * backdrop, so the petals, dust and candlelight simply carry on across the
 * scroll. With `prefers-reduced-motion` nothing is created and the section
 * renders in its finished state.
 */
export default function CelebrationSection() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let detachHover = () => {};

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const corners = find('.celebration__corner .corner__art');
      const crest = find('.celebration__crest');
      const label = find('.celebration__label');
      const rules = find('.celebration__rule');
      const titleLines = find('.celebration__title-line');
      const copy = find('.celebration__copy');
      const band = find('.celebration__names');
      const details = find('.celebration__details');
      const halo = find('.celebration__halo');
      const panel = find('.celebration__frame');

      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: root, start: revealStart(78), once: true },
        })
        // The glass plaque materialises first; its words follow.
        .fromTo(
          panel,
          cardFrom({ y: 46, scale: 0.968 }),
          cardTo({ duration: 1.35 }),
          0,
        )
        .fromTo(
          crest,
          { opacity: 0, scale: 0.86 },
          { opacity: 1, scale: 1, duration: 0.9, transformOrigin: 'center' },
          0,
        )
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
          0.1,
        )
        .fromTo(
          label,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8 },
          0.15,
        )
        // The two ornamental rules draw themselves out in turn.
        .fromTo(
          rules,
          { opacity: 0, scaleX: 0.4 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.85,
            stagger: 0.95,
            transformOrigin: 'center',
          },
          0.3,
        )
        .fromTo(
          titleLines,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.18 },
          0.45,
        )
        .fromTo(
          copy,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.95 },
          0.95,
        )
        .fromTo(
          band,
          { opacity: 0, y: 20, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            transformOrigin: 'center',
          },
          1.25,
        );

      // The logistics block appears only once real details exist, so it is
      // added conditionally rather than chained blindly.
      fromToIf(
        tl,
        1.55,
        details,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9 },
      );

      // Give the choreography room to be watched on a phone.
      cinematicOnPhones(tl);

      // Very subtle depth: only the halo drifts, so the words stay put.
      gsap.fromTo(
        halo,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        },
      );

      // Web fonts can arrive after the first measurement, so re-measure once
      // they are in and every trigger lines up with the final layout.
      document.fonts?.ready?.then(() => ScrollTrigger.refresh());
      // The plaque answers the pointer with a slow, small lift.
      detachHover = attachCardHover(panel);
    }, root);

    return () => {
      detachHover();
      ctx.revert();
    };
  }, []);

  const { wedding } = useI18n();
  const { celebration, names } = wedding;

  return (
    <section
      className="celebration"
      ref={rootRef}
      aria-labelledby="celebration-title"
    >
      <div className="celebration__halo" aria-hidden="true" />

      <div className="celebration__frame glass glass--panel glass-inset">
        <CardOrnament kind="vine" />
        <CardOrnament kind="vine" className="card-orn--floor" />
        <CardOrnament kind="medallion" />
        <CardOrnament kind="crest" />
        <GoldFrame sweep />
        <div className="celebration__corners" aria-hidden="true">
          {CORNERS.map((position) => (
            <CornerOrnament
              key={position}
              position={position}
              className="celebration__corner"
            />
          ))}
        </div>

        <div className="celebration__inner">
          <div className="celebration__crest">
            <span className="celebration__crest-line" aria-hidden="true" />
            <Crown
              className="celebration__crest-icon"
              size={19}
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <span className="celebration__crest-line" aria-hidden="true" />
          </div>

          <p className="celebration__label">{celebration.label}</p>

          <Divider className="celebration__rule" />

          <h2 className="celebration__title" id="celebration-title">
            <span className="celebration__title-line">
              {celebration.titleTop}
            </span>{' '}
            <span className="celebration__title-line">
              {celebration.titleLead} <em>{celebration.titleAccent}</em>
            </span>
          </h2>

          <p className="celebration__copy">{celebration.message}</p>

          {/* The names return quietly, as a monogram band rather than a repeat
              of the hero — and the only glass accent in this phase. */}
          <p className="celebration__names glass glass--band">
            <span>{names.first}</span> <em>&amp;</em> <span>{names.second}</span>
          </p>

          <Divider className="celebration__rule" />

          {/* Renders nothing at all until real details are configured. */}
          <EventDetails className="celebration__details" />
        </div>
      </div>
    </section>
  );
}
