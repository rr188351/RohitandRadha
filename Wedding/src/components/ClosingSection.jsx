import { useEffect, useRef } from 'react';

import { gsap } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import { attachCardHover, cardFrom, cardTo } from '../lib/motion.js';
import { wedding } from '../config/wedding.js';
import GoldFrame from './GoldFrame.jsx';
import { CornerOrnament, Divider } from './Ornaments.jsx';

const CORNERS = ['tl', 'tr', 'br', 'bl'];

/**
 * Phase 08 — the final blessing.
 *
 * The last page of the invitation: a quiet, centred closing after the RSVP. It
 * deliberately does not repeat that panel's layout — this is a narrower,
 * letter-like composition with an ornamental medallion at its head and the
 * couple's names set as a signature at its foot.
 *
 * The reveal runs once, in one continuous arc: ambient light first, then the
 * glass rises, then the words, and the signature last. Nothing is pinned and
 * the scroll stays native. With `prefers-reduced-motion` the section simply
 * renders in its finished state.
 */
export default function ClosingSection() {
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

      const halo = find('.closing__halo');
      const panel = find('.closing__panel');
      const corners = find('.closing__corners .corner__art');
      const mark = find('.closing__mark');
      const eyebrow = find('.closing__eyebrow');
      const rules = find('.closing__rule');
      const titleLines = find('.closing__title-inner');
      const message = find('.closing__message');
      const signature = find('.closing__signature');
      const signoff = find('.closing__signoff');

      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: root, start: revealStart(80), once: true },
        })
        // 1. Ambient light settles over the scene.
        .fromTo(
          halo,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.6, transformOrigin: 'center' },
          0,
        )
        // 2. The glass rises.
        .fromTo(
          panel,
          cardFrom({ y: 58, scale: 0.963, rotate: 0.25 }),
          cardTo({ duration: 1.4 }),
          0.15,
        )
        .fromTo(
          corners,
          { opacity: 0, scale: 0.74 },
          {
            opacity: 0.5,
            scale: 1,
            duration: 1,
            stagger: 0.06,
            transformOrigin: 'center',
          },
          0.5,
        )
        // 3. Ornament, eyebrow and the two gem rules.
        .fromTo(
          mark,
          { opacity: 0, scale: 0.82 },
          { opacity: 1, scale: 1, duration: 1, transformOrigin: 'center' },
          0.6,
        )
        .fromTo(
          eyebrow,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.8 },
          0.75,
        )
        .fromTo(
          rules,
          { opacity: 0, scaleX: 0.4 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.9,
            stagger: 0.95,
            transformOrigin: 'center',
          },
          0.9,
        )
        // 4. The blessing, line by line.
        .fromTo(
          titleLines,
          { yPercent: 112, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.16,
            ease: 'power3.out',
          },
          1.05,
        )
        .fromTo(
          message,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.95 },
          1.55,
        )
        // 5. The signature is the very last thing to arrive.
        .fromTo(
          signature,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1.1 },
          1.9,
        )
        .fromTo(signoff, { opacity: 0 }, { opacity: 1, duration: 0.9 }, 2.2);

      cinematicOnPhones(tl);

      // The final page lifts gently under the pointer, like the others.
      detachHover = attachCardHover(panel);
    }, root);

    return () => {
      detachHover();
      ctx.revert();
    };
  }, []);

  const { closing, names } = wedding;

  return (
    <section className="closing" ref={rootRef} aria-labelledby="closing-title">
      <span className="closing__halo" aria-hidden="true" />

      <div className="closing__stage">
        <article className="closing__panel glass glass--panel glass-inset">
          <span className="glass-grain" aria-hidden="true" />
          <GoldFrame tone="rich" sweep />

          <div className="closing__corners" aria-hidden="true">
            {CORNERS.map((position) => (
              <CornerOrnament
                key={position}
                position={position}
                className="closing__corner"
              />
            ))}
          </div>

          <div className="closing__inner">
            {/* An original ornament: a crowned palace arch with a jewel. */}
            <svg
              className="closing__mark"
              viewBox="0 0 72 68"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M26 11 L30.5 4.5 L36 9 L41.5 4.5 L46 11"
                stroke="currentColor"
                strokeOpacity="0.5"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="36"
                cy="1.8"
                r="1.6"
                fill="currentColor"
                fillOpacity="0.6"
              />
              <path
                d="M16 64 V34 C16 22 25 14 36 14 C47 14 56 22 56 34 V64"
                stroke="currentColor"
                strokeOpacity="0.55"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              <path
                d="M10 64 H62"
                stroke="currentColor"
                strokeOpacity="0.35"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d="M36 32 L41.5 38.5 L36 45 L30.5 38.5 Z"
                fill="currentColor"
                fillOpacity="0.55"
              />
            </svg>

            <p className="closing__eyebrow">{closing.eyebrow}</p>

            <Divider className="closing__rule" />

            <h2 className="closing__title" id="closing-title">
              <span className="closing__title-mask">
                <span className="closing__title-inner">{closing.titleLead}</span>
              </span>{' '}
              <span className="closing__title-mask">
                <span className="closing__title-inner">
                  {closing.titleAccentLead} <em>{closing.titleAccent}</em>
                </span>
              </span>
            </h2>

            <p className="closing__message">{closing.message}</p>

            <Divider className="closing__rule" />

            <p className="closing__signature">
              <span>{names.first}</span> <em>&amp;</em>{' '}
              <span>{names.second}</span>
            </p>

            <p className="closing__signoff">{closing.signoff}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
