import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { gsap } from '../lib/gsap';

/** Floating gold specks — a generous drift, but every speck stays delicate. */
const DUST_COUNT = 40;

/**
 * Rose petals in the scene. Denser than the original handful so the background
 * reads as properly alive, with a lighter budget on compact screens.
 */
const PETAL_COUNT = 16;
const PETAL_COUNT_COMPACT = 9;

/** Query used for the compact (mobile) petal budget. */
const COMPACT_QUERY = '(max-width: 640px)';

/** Gradients cycled across the petals: rose, deep wine and a gold-kissed one. */
const PETAL_FILLS = [
  'petal-rose',
  'petal-wine',
  'petal-gold',
  'petal-rose',
  'petal-wine',
];

/**
 * Deterministic pseudo-random generator (LCG) so layout values stay stable
 * between renders instead of being re-shuffled on every mount.
 */
function createRandom(seed) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createDust(count) {
  const random = createRandom(20261019);

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    style: {
      left: `${(random() * 100).toFixed(2)}%`,
      top: `${(random() * 100).toFixed(2)}%`,
      width: `${(1.4 + random() * 2.6).toFixed(2)}px`,
      height: `${(1.4 + random() * 2.6).toFixed(2)}px`,
      '--dust-duration': `${(26 + random() * 24).toFixed(1)}s`,
      '--dust-delay': `${(-random() * 26).toFixed(1)}s`,
      '--dust-twinkle-duration': `${(7 + random() * 7).toFixed(1)}s`,
      '--dust-twinkle-delay': `${(-random() * 14).toFixed(1)}s`,
      '--dust-drift': `${(random() * 20 - 10).toFixed(1)}px`,
      '--dust-opacity': (0.14 + random() * 0.24).toFixed(2),
    },
  }));
}

/**
 * Petal definitions. Only the layout is fixed here — all movement is created by
 * GSAP, so nothing but transforms and opacity is ever animated.
 */
function createPetals(count) {
  const random = createRandom(776611);

  return Array.from({ length: count }, (_, index) => {
    // Nearer petals read larger, more opaque and drift a touch faster; the rest
    // sit back in the haze. Alternating sides keeps them in the outer bands so
    // the centre of the composition stays uncluttered.
    const near = random() > 0.42;
    const width = Math.round(near ? 18 + random() * 9 : 9 + random() * 8);
    const onLeft = index % 2 === 0;
    const duration = Number(
      (near ? 34 + random() * 14 : 46 + random() * 18).toFixed(1),
    );

    return {
      id: index,
      fill: PETAL_FILLS[index % PETAL_FILLS.length],
      style: {
        left: `${(onLeft ? 3 + random() * 22 : 74 + random() * 22).toFixed(2)}%`,
        width: `${width}px`,
        height: `${Math.round(width * 1.2)}px`,
      },
      depth: near ? 1 : 0.55,
      direction: onLeft ? 1 : -1,
      duration,
      // Phases are spread evenly across the cycle so petals keep arriving
      // steadily instead of clumping together into groups.
      offset: Number(((index * duration) / count + random() * 4).toFixed(1)),
    };
  });
}

/**
 * Layered atmospheric background: a burgundy gradient base, a slowly breathing
 * golden aura, the key light behind the invitation, warm candlelight pools, a
 * faint palace arch, warm side glows, darkened corners, film grain, drifting
 * rose petals and gold dust.
 *
 * Only transforms and opacity are animated, and the petals are driven by GSAP
 * rather than React state, so nothing here re-renders while the scene moves.
 * The whole tree is decorative and therefore hidden from assistive technology.
 */
export default function AmbientBackdrop({ boost = 0 }) {
  const rootRef = useRef(null);
  const petalLoopsRef = useRef([]);
  const dust = useMemo(() => createDust(DUST_COUNT), []);
  const petals = useMemo(() => createPetals(PETAL_COUNT), []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // Reduced motion: the stylesheet already hides the petals and stills the
    // ambient light, so there is nothing to drive here.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const initialiseLane = (lane) => {
      const petal = lane.querySelector('.petal');
      if (!petal) return undefined;

      const depth = Number(lane.dataset.depth ?? '1');
      const direction = Number(lane.dataset.direction ?? '1');
      const duration = Number(lane.dataset.duration ?? '44');
      const offset = Number(lane.dataset.offset ?? '0');

      const loop = gsap.timeline({
        repeat: -1,
        repeatRefresh: true,
        defaults: { ease: 'none' },
        // A negative delay drops each petal into a different point of its cycle
        // so the scene is already alive on the very first frame.
        delay: -offset,
      });

      // Vertical travel is a percentage of the stage height, so it stays
      // correct on every viewport without any resize bookkeeping.
      loop.fromTo(lane, { yPercent: -34 }, { yPercent: 134, duration }, 0);

      // A slow sideways drift turns the descent diagonal. `repeatRefresh`
      // re-picks the target on every lap so the path never looks mechanical.
      loop.fromTo(
        lane,
        { xPercent: -6 * direction },
        {
          xPercent: () => gsap.utils.random(3, 9) * direction,
          duration,
          ease: 'sine.inOut',
        },
        0,
      );

      const total = loop.duration();

      // A tumbling rotation that starts from a new angle on every lap.
      loop.fromTo(
        petal,
        { rotation: () => gsap.utils.random(-24, 24) },
        {
          rotation: () => gsap.utils.random(130, 300) * direction,
          duration: total,
        },
        0,
      );

      // Fade in before the petal reaches the frame, fade out as it leaves.
      loop.fromTo(
        petal,
        { opacity: 0 },
        { opacity: depth * 0.5, duration: total * 0.2, ease: 'sine.out' },
        0,
      );
      loop.to(
        petal,
        { opacity: 0, duration: total * 0.3, ease: 'sine.in' },
        total * 0.7,
      );

      return loop;
    };

    // Builds the petal loops for one breakpoint and remembers them, so the
    // surge below can nudge their speed. The returned cleanup keeps the ref
    // honest whenever the viewport changes.
    const buildLoops = (limit) => {
      const lanes = gsap.utils.toArray('.petal-lane', root);
      const chosen = typeof limit === 'number' ? lanes.slice(0, limit) : lanes;
      petalLoopsRef.current = chosen.map(initialiseLane).filter(Boolean);

      return () => {
        petalLoopsRef.current = [];
      };
    };

    // matchMedia keeps the animated element count down on small screens and
    // reverts every petal cleanly when the viewport changes or on unmount.
    const mm = gsap.matchMedia();

    mm.add('(min-width: 641px)', () => buildLoops());

    mm.add(COMPACT_QUERY, () => buildLoops(PETAL_COUNT_COMPACT));

    return () => mm.revert();
  }, []);

  // The petals pick up speed for a moment as the invitation opens, then ease
  // back to their normal drift. Driven through a proxy object so the speed of
  // every loop is set explicitly.
  useEffect(() => {
    if (!boost) return undefined;

    const rate = { value: 1 };
    const apply = () => {
      const loops = petalLoopsRef.current;
      for (let index = 0; index < loops.length; index += 1) {
        loops[index].timeScale(rate.value);
      }
    };

    const surge = gsap.to(rate, {
      value: 1.6,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: apply,
      onComplete: () => {
        gsap.to(rate, {
          value: 1,
          duration: 4.5,
          ease: 'sine.inOut',
          onUpdate: apply,
        });
      },
    });

    return () => surge.kill();
  }, [boost]);

  return (
    <div className="backdrop" aria-hidden="true" ref={rootRef}>
      <div className="backdrop__base" />
      <div className="backdrop__aura" />
      <div className="backdrop__glow" />

      {/* Warm distant light, always behind the invitation card. */}
      <div className="backdrop__candlelight">
        <div className="candle candle--key" />
        <div className="candle candle--high" />
        <div className="candle candle--low" />
      </div>

      <div className="backdrop__arch" />
      <div className="backdrop__column backdrop__column--left" />
      <div className="backdrop__column backdrop__column--right" />
      <div className="backdrop__vignette" />
      <div className="backdrop__grain" />

      {/* Gradient paint servers for the petals. Zero sized but still rendered,
          which keeps every `url(#id)` reference resolving in all browsers. */}
      <svg className="petal-defs" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="petal-rose" x1="0" y1="1" x2="0.4" y2="0">
            <stop offset="0" stopColor="#57182a" />
            <stop offset="0.55" stopColor="#8c3043" />
            <stop offset="1" stopColor="#b4576a" />
          </linearGradient>
          <linearGradient id="petal-wine" x1="0" y1="1" x2="0.35" y2="0">
            <stop offset="0" stopColor="#400e1c" />
            <stop offset="0.6" stopColor="#6c2132" />
            <stop offset="1" stopColor="#974050" />
          </linearGradient>
          <linearGradient id="petal-gold" x1="0" y1="1" x2="0.45" y2="0">
            <stop offset="0" stopColor="#4d1220" />
            <stop offset="0.5" stopColor="#8e4436" />
            <stop offset="1" stopColor="#d3a86f" />
          </linearGradient>
        </defs>
      </svg>

      <div className="backdrop__petals">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="petal-lane"
            data-depth={petal.depth}
            data-direction={petal.direction}
            data-duration={petal.duration}
            data-offset={petal.offset}
          >
            <svg
              className="petal"
              viewBox="0 0 40 48"
              style={petal.style}
              aria-hidden="true"
              focusable="false"
            >
              <path
                className="petal__shape"
                d="M20 48C11 41 1 33 1 21C1 11 8 3 15 1.2C17 0.7 19 1.4 20 3C21 1.4 23 0.7 25 1.2C32 3 39 11 39 21C39 33 29 41 20 48Z"
                fill={`url(#${petal.fill})`}
              />
              <path
                className="petal__vein"
                d="M19.5 44C17 34 15.6 25 16.8 13"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="backdrop__dust">
        {dust.map((particle) => (
          <span key={particle.id} className="dust" style={particle.style} />
        ))}
      </div>
    </div>
  );
}
