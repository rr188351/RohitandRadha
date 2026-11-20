import { useEffect, useRef } from 'react';

import { gsap } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import { attachCardHover, cardFrom, cardTo } from '../lib/motion.js';
import { gallery } from '../config/gallery.js';
import { CornerOrnament } from './Ornaments.jsx';

const CORNERS = ['tl', 'tr', 'br', 'bl'];

/**
 * Phase 05 — the memories gallery.
 *
 * Four photographs in an editorial arrangement: one dominant portrait and three
 * supporting frames at differing widths and ratios, so nothing reads as a grid.
 * The composition is reorganised (not shrunk) on small screens.
 *
 * Scroll stays native. Every photograph has its own `once` ScrollTrigger, so it
 * settles into its frame as it arrives and never replays. Only the featured
 * photograph carries a hint of parallax, and that is expressed in `yPercent`
 * while its entrance uses `y`, so the two never contend for the same transform.
 *
 * The ambient environment is untouched — it lives in the fixed backdrop — and
 * with `prefers-reduced-motion` nothing is created, leaving every photograph
 * fully visible exactly as designed.
 */
export default function GallerySection() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const hoverCleanups = [];

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const header = root.querySelector('.gallery__header');
      const meta = find('.gallery__meta');
      const line = find('.gallery__meta-line');
      const titleLines = find('.gallery__title-inner');
      const intro = find('.gallery__intro');

      // --- Header ---
      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: header, start: revealStart(84), once: true },
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
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.9,
            transformOrigin: 'left center',
          },
          0.1,
        )
        .fromTo(
          titleLines,
          { yPercent: 112, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.14,
            ease: 'power3.out',
          },
          0.3,
        )
        .fromTo(
          intro,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.75,
        );

      cinematicOnPhones(tl);

      // --- Each photograph settles into its frame ---
      find('.shot').forEach((shot) => {
        const frame = shot.querySelector('.shot__frame');
        const image = shot.querySelector('.shot__image');
        if (!frame || !image) return;

        // The featured photograph is unveiled by a soft curtain on desktop;
        // everywhere else it simply rises into place with the others.
        const curtain =
          shot.classList.contains('shot--lead') &&
          window.matchMedia('(min-width: 900px)').matches;

        const from = cardFrom({ y: 42, scale: 0.958 });
        const to = cardTo({ duration: 1.25 });

        if (curtain) {
          from.clipPath = 'inset(0% 0% 100% 0%)';
          to.clipPath = 'inset(0% 0% 0% 0%)';
          to.clearProps = 'transform,clipPath';
        }

        const shotTl = gsap
          .timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: { trigger: shot, start: revealStart(88), once: true },
          })
          .fromTo(frame, from, to, 0)
          // The inline transform is cleared afterwards so the stylesheet's
          // hover zoom is free to take over.
          .fromTo(
            image,
            { scale: 1.07 },
            { scale: 1, duration: 1.4, clearProps: 'transform' },
            0,
          );

        cinematicOnPhones(shotTl);

        hoverCleanups.push(attachCardHover(shot, frame));
      });

      // --- A whisper of drift on the featured photograph only ---
      const leadColumn = root.querySelector('.gallery__lead');
      const leadFrame = root.querySelector('.shot--lead .shot__frame');

      if (leadColumn && leadFrame) {
        gsap.fromTo(
          leadFrame,
          { yPercent: -2.5 },
          {
            yPercent: 2.5,
            ease: 'none',
            scrollTrigger: {
              trigger: leadColumn,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          },
        );
      }
    }, root);

    return () => {
      hoverCleanups.forEach((detach) => detach());
      ctx.revert();
    };
  }, []);

  // Resolved by id so the composition never depends on array order.
  const imageById = Object.fromEntries(
    gallery.images.map((image) => [image.id, image]),
  );

  const renderShot = (id, modifier) => {
    const image = imageById[id];
    if (!image) return null;

    return (
      <figure className={`shot shot--${modifier}`} key={image.id}>
        <span className="shot__frame">
          <img
            className="shot__image"
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
        </span>

        {/* A fine gold mat, drawn just outside the photograph. */}
        {modifier === 'lead' && (
          <span className="shot__corners" aria-hidden="true">
            {CORNERS.map((position) => (
              <CornerOrnament
                key={position}
                position={position}
                className="shot__corner"
              />
            ))}
          </span>
        )}
      </figure>
    );
  };

  return (
    <section className="gallery" ref={rootRef} aria-labelledby="gallery-title">
      <header className="gallery__header">
        <p className="gallery__meta">
          <span className="gallery__label">{gallery.label}</span>
          <span className="gallery__meta-line" aria-hidden="true" />
        </p>

        <h2 className="gallery__title" id="gallery-title">
          <span className="gallery__title-mask">
            <span className="gallery__title-inner">{gallery.titleLead}</span>
          </span>{' '}
          <span className="gallery__title-mask">
            <span className="gallery__title-inner">
              {gallery.titleAccentLead} <em>{gallery.titleAccent}</em>
            </span>
          </span>
        </h2>

        <p className="gallery__intro">{gallery.intro}</p>
      </header>

      <div className="gallery__grid">
        <div className="gallery__lead">{renderShot('lead', 'lead')}</div>

        <div className="gallery__support">
          {renderShot('bride', 'bride')}
          {renderShot('ceremony', 'ceremony')}
          {renderShot('detail', 'detail')}
        </div>
      </div>
    </section>
  );
}
