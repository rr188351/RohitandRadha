import { useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowRight, Crown } from 'lucide-react';

import { gsap } from '../lib/gsap';
import { useI18n } from '../i18n/index.jsx';
import AmbientBackdrop from './AmbientBackdrop.jsx';
import GoldFrame from './GoldFrame.jsx';
import { CornerOrnament, Divider } from './Ornaments.jsx';

const CORNERS = ['tl', 'tr', 'br', 'bl'];

/**
 * Cinematic entrance for the opening invitation screen, plus the exit that
 * hands over to the wedding hero.
 *
 * Both timelines are created inside a `gsap.context` scoped to the section, so
 * every selector stays local and everything is cleanly reverted on unmount.
 * When the visitor prefers reduced motion neither timeline runs — the
 * stylesheet already renders the correct state for each phase.
 */
export default function InvitationIntro({ isOpen = false, onOpen }) {
  const { ui } = useI18n();
  const rootRef = useRef(null);
  const entranceRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) return undefined;

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const glow = find('.backdrop__glow');
      const card = find('.invitation');
      const ornaments = find('[data-reveal="ornament"]');
      const crest = find('[data-reveal="crest"]');
      const rules = find('[data-reveal="rule"]');
      const texts = find('[data-reveal="text"]');
      const button = find('[data-reveal="button"]');

      entranceRef.current = gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        // 1. Ambient light fades in.
        .fromTo(
          glow,
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 2.4, ease: 'sine.out' },
          0,
        )
        // 2. Invitation card rises gently into place.
        .fromTo(
          card,
          { opacity: 0, y: 48, scale: 0.988 },
          { opacity: 1, y: 0, scale: 1, duration: 1.7, ease: 'power3.out' },
          0.45,
        )
        // 3. Ornamental corners and crest reveal subtly.
        .fromTo(
          ornaments,
          { opacity: 0, scale: 0.7 },
          {
            opacity: 0.5,
            scale: 1,
            duration: 1.1,
            stagger: 0.09,
            transformOrigin: 'center',
          },
          1.05,
        )
        .fromTo(
          crest,
          { opacity: 0, scale: 0.86 },
          { opacity: 1, scale: 1, duration: 1.2, transformOrigin: 'center' },
          1.05,
        )
        // 4. Rules draw themselves out.
        .fromTo(
          rules,
          { opacity: 0, scaleX: 0.35 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 1.15,
            stagger: 0.2,
            transformOrigin: 'center',
          },
          1.3,
        )
        // 5. Text enters in a staggered sequence.
        .fromTo(
          texts,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1.05, stagger: 0.22 },
          1.5,
        )
        // 6. The button appears last. Its inline props are cleared afterwards
        //    so the CSS hover lift and press states take over cleanly.
        .fromTo(
          button,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.95, clearProps: 'all' },
          2.4,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  // Cinematic exit. Timed against the hero's reveal timeline in `WeddingHero`
  // so the card dissolving and the names arriving read as one movement.
  useEffect(() => {
    if (!isOpen) return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    // Reduced motion: the stylesheet swaps the two screens instead.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    // If the visitor clicks before the entrance has finished, abandon it so the
    // two timelines never fight over the same properties.
    entranceRef.current?.kill();

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const texts = find('[data-reveal="text"]');
      const crest = find('[data-reveal="crest"]');
      const rules = find('[data-reveal="rule"]');
      const ornaments = find('[data-reveal="ornament"]');
      const card = find('.invitation');

      gsap
        .timeline({ defaults: { ease: 'power2.inOut' } })
        // The wording lifts away first, then the ornaments, then the glass.
        .to(texts, { autoAlpha: 0, y: -16, duration: 0.6, stagger: 0.05 }, 0)
        .to(
          crest,
          {
            autoAlpha: 0,
            scale: 0.94,
            duration: 0.5,
            transformOrigin: 'center',
          },
          0.08,
        )
        .to(
          rules,
          {
            autoAlpha: 0,
            scaleX: 0.5,
            duration: 0.5,
            transformOrigin: 'center',
          },
          0.14,
        )
        .to(
          ornaments,
          {
            autoAlpha: 0,
            scale: 1.12,
            duration: 0.6,
            stagger: 0.04,
            transformOrigin: 'center',
          },
          0.18,
        )
        // The card lifts and dissolves, handing over to the hero.
        .to(
          card,
          {
            autoAlpha: 0,
            y: -28,
            scale: 1.03,
            duration: 0.95,
            ease: 'power2.in',
          },
          0.4,
        );
    }, root);

    return () => ctx.revert();
  }, [isOpen]);

  return (
    <section className="intro" ref={rootRef} aria-labelledby="invitation-title">
      {/* The backdrop stays mounted for the whole experience, so petals, dust
          and candlelight simply continue into the hero. */}
      <AmbientBackdrop boost={isOpen ? 1 : 0} />

      <article className="glass glass--panel invitation">
        <span className="glass-grain" aria-hidden="true" />
        <GoldFrame tone="rich" sweep />

        {CORNERS.map((position) => (
          <CornerOrnament key={position} position={position} />
        ))}

        <div className="invitation__inner">
          <div className="invitation__crest" data-reveal="crest">
            <span className="invitation__crest-line" aria-hidden="true" />
            <Crown
              className="invitation__crest-icon"
              size={19}
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <span className="invitation__crest-line" aria-hidden="true" />
          </div>

          <p className="invitation__label" data-reveal="text">
            {ui.intro.label}
          </p>

          <Divider />

          <h1
            className="invitation__title"
            id="invitation-title"
            data-reveal="text"
          >
            {ui.intro.taglineLead} <em>{ui.intro.taglineAccent}</em>
          </h1>

          <p className="invitation__text" data-reveal="text">
            {ui.intro.supporting}
          </p>

          <Divider />

          <button
            className={`invitation__button${
              isOpen ? ' invitation__button--pressed' : ''
            }`}
            type="button"
            data-reveal="button"
            onClick={onOpen}
            aria-disabled={isOpen}
          >
            <span className="invitation__button-label">
              {ui.intro.open}
            </span>
            <ArrowRight
              className="invitation__button-icon"
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        </div>
      </article>
    </section>
  );
}
