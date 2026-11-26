import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { gsap, ScrollTrigger } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import { useI18n } from '../i18n/index.jsx';
import {
  GUEST_REFRESH_MS,
  RSVP_ACCEPTED_EVENT,
  fetchAcceptedGuests,
} from '../config/guestsApi.js';
import { Divider } from './Ornaments.jsx';
import CardOrnament from './CardOrnament.jsx';

/** The placeholder capsules the loading state breathes through. */
const LOADING_CAPSULES = [0, 1, 2, 3];

/**
 * How many rows of names the wall shows before it is folded.
 *
 * The wall can carry anything from a handful of names to a few hundred, and the
 * closing letter sits directly below it, so it opens at a few rows and the guest
 * unfolds the rest rather than the section growing past the whole screen.
 */
const COLLAPSE_ROWS = 4;

/**
 * Phase 19 — our beloved guests.
 *
 * A wall of the people who accepted, drawn from the public read-only endpoint.
 * The names are the composition — each set in its own small plaque, and the
 * plaques gathered on one royal glass panel — so the section reads as a page of
 * blessings rather than a list in a box.
 *
 * Four things keep it honest and quiet:
 *
 *   · the list refreshes on a slow interval (and on returning to the tab, and
 *     the instant a reply is stored) but re-renders ONLY when it truly changed,
 *     so an unchanged refresh costs nothing and replays nothing;
 *   · only genuinely new names animate - the rest of the wall is never touched;
 *   · a failure leaves the wall alone: names already on it stay, and only a wall
 *     that never loaded shows the retry line. The invitation never depends on
 *     this section;
 *   · the names sit on a proper royal glass panel (its own surface, its own
 *     ornament) and the wall folds to `COLLAPSE_ROWS` rows, measured from the
 *     real rows rather than guessed from the viewport, so a two-hundred-name
 *     celebration never swallows the page. The clip is presentational only: the
 *     whole list stays in the DOM, and a screen reader still hears every name.
 *
 * With `prefers-reduced-motion` the section renders complete and still, and the
 * fold opens without an animation.
 */
export default function GuestWall() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);

  // The rendered names, mirrored in a ref so a refresh can compare without
  // re-rendering, plus a ticket so a slow response can never overwrite a newer one.
  const guestsRef = useRef([]);
  const requestRef = useRef(0);
  const revealedRef = useRef(false);
  const waveRef = useRef(null);

  // The fold: the clipping wrapper, the wall it clips, the row geometry measured
  // from them, and a ticket marking that the first measurement has run.
  const clipRef = useRef(null);
  const wallRef = useRef(null);
  const layoutRef = useRef({ collapsed: 0, full: 0 });
  const expandedRef = useRef(false);
  const measuredRef = useRef(false);
  const foldTweenRef = useRef(null);

  const [guests, setGuests] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  // Names that arrived since the last time the wall animated.
  const [freshNames, setFreshNames] = useState([]);
  // The fold state: whether the wall is long enough to fold, and whether it is open.
  const [foldable, setFoldable] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    const ticket = (requestRef.current += 1);

    try {
      const names = await fetchAcceptedGuests();
      if (ticket !== requestRef.current) return; // a newer read has the answer

      const previous = guestsRef.current;
      const changed =
        previous.length !== names.length ||
        previous.some((name, index) => name !== names[index]);

      if (changed) {
        guestsRef.current = names;
        const added = names.filter((name) => !previous.includes(name));
        if (added.length) setFreshNames(added);
        setGuests(names);
      }

      setStatus('ready');
    } catch {
      if (ticket !== requestRef.current) return;
      // A failed refresh must never take names off the wall - only a wall that
      // has never loaded shows the retry state.
      setStatus((current) => (guestsRef.current.length ? current : 'error'));
    }
  }, []);

  const retry = useCallback(() => {
    setStatus('loading');
    load();
  }, [load]);

  // --- The fold: four rows standing, the rest behind one tap -----------------
  //
  // The folded height comes from the REAL rows — their layout tops and heights,
  // which transforms cannot skew, so the entrance wave cannot distort it — rather
  // than from a guess about the viewport. A long name that wraps to a second line
  // therefore pushes the fold down with it instead of being cut through.
  const applyFold = useCallback((open, animate) => {
    const clip = clipRef.current;
    const { collapsed, full } = layoutRef.current;
    if (!clip || !full) return;

    // The CSS `max-height` only guards the frame before the first measurement;
    // once the rows have been read, the height belongs to us.
    clip.style.maxHeight = 'none';

    const target = open ? full : collapsed;
    if (measuredRef.current && Math.abs(clip.offsetHeight - target) < 1) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    foldTweenRef.current?.kill();
    foldTweenRef.current = null;

    if (!animate || reduce) {
      gsap.set(clip, { height: target });
      if (measuredRef.current) ScrollTrigger.refresh();
      return;
    }

    foldTweenRef.current = gsap.to(clip, {
      height: target,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        foldTweenRef.current = null;
        // The closing letter moves down when the wall unfolds, so its reveal has
        // to be told where it now begins.
        ScrollTrigger.refresh();
      },
    });
  }, []);

  useLayoutEffect(() => {
    const wall = wallRef.current;
    if (!wall) return undefined;

    const measure = () => {
      const plaques = Array.from(wall.querySelectorAll('.guests__plaque'));

      if (!plaques.length) {
        layoutRef.current = { collapsed: 0, full: 0 };
        setFoldable(false);
        return;
      }

      // The plaques of one flex row share a layout top, so they are grouped by it.
      const rows = [];
      plaques.forEach((plaque) => {
        const top = plaque.offsetTop;
        const bottom = top + plaque.offsetHeight;
        const row = rows[rows.length - 1];

        if (row && Math.abs(top - row.top) < 6) {
          if (bottom > row.bottom) row.bottom = bottom;
        } else {
          rows.push({ top, bottom });
        }
      });

      const wallTop = wall.offsetTop;
      const full = wall.offsetHeight;
      const canFold = rows.length > COLLAPSE_ROWS;
      const collapsed = canFold
        ? Math.max(0, rows[COLLAPSE_ROWS - 1].bottom - wallTop)
        : full;

      layoutRef.current = { collapsed, full };
      setFoldable(canFold);
      // The first pass always sets the height; only later passes (a re-wrap, or
      // the guest unfolding) need to know that the layout below has moved.
      applyFold(expandedRef.current, false);
      measuredRef.current = true;
    };

    measure();

    // A re-wrap (a narrower screen, a late font, a name that grew) changes the
    // rows, so the fold is re-derived from the wall's own size.
    const observer = new ResizeObserver(measure);
    observer.observe(wall);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [guests, applyFold]);

  useEffect(() => {
    expandedRef.current = expanded;
    applyFold(expanded, true);
  }, [expanded, applyFold]);

  // A pending fold is stopped if the section ever goes away.
  useEffect(() => () => foldTweenRef.current?.kill(), []);

  const toggleFold = useCallback(() => setExpanded((open) => !open), []);

  // --- The data: one read, then a slow self-refresh -------------------------
  useEffect(() => {
    load();

    const interval = window.setInterval(() => {
      // Nothing is fetched while the tab is in the background.
      if (document.visibilityState === 'visible') load();
    }, GUEST_REFRESH_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') load();
    };

    // A guest who has just accepted sees their own name arrive at once.
    const onAccepted = () => {
      window.setTimeout(load, 1200);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener(RSVP_ACCEPTED_EVENT, onAccepted);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener(RSVP_ACCEPTED_EVENT, onAccepted);
    };
  }, [load]);

  // --- Only genuinely new names animate; an unchanged wall is never touched --
  useEffect(() => {
    if (!freshNames.length) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFreshNames([]);
      return undefined;
    }

    // Before the section has revealed itself, its reveal carries these names -
    // it collects the plaques as it plays - so they are left marked here and
    // nothing is animated twice.
    if (!revealedRef.current) return undefined;

    const stage = stageRef.current;
    const fresh = stage
      ? Array.from(stage.querySelectorAll('.guests__plaque')).filter((plaque) =>
          freshNames.includes(plaque.dataset.name),
        )
      : [];

    setFreshNames([]);
    if (!fresh.length) return undefined;

    // A previous wave is stopped, never left overlapping a new one.
    waveRef.current?.kill();
    waveRef.current = gsap.fromTo(
      fresh,
      { opacity: 0, y: 14, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'transform',
      },
    );

    return undefined;
  }, [freshNames]);

  // A pending wave is stopped if the section ever goes away.
  useEffect(() => () => waveRef.current?.kill(), []);

  // --- The reveal ----------------------------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealedRef.current = true;
      return undefined;
    }

    let waveTween = null;

    const ctx = gsap.context(() => {
      const find = (selector) => gsap.utils.toArray(selector, root);

      const halo = find('.guests__halo');
      const eyebrow = find('.guests__eyebrow');
      const rules = find('.guests__rule');
      const titleLines = find('.guests__title-inner');
      const intro = find('.guests__intro');
      const signoff = find('.guests__signoff');

      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: root, start: revealStart(80), once: true },
        })
        // 1. Candlelight gathers.
        .fromTo(
          halo,
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 1.6, transformOrigin: 'center' },
          0,
        )
        // 2. The words of the section.
        .fromTo(eyebrow, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.25)
        .fromTo(
          rules,
          { opacity: 0, scaleX: 0.4 },
          { opacity: 1, scaleX: 1, duration: 0.9, transformOrigin: 'center' },
          0.35,
        )
        .fromTo(
          titleLines,
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.14, ease: 'power3.out' },
          0.5,
        )
        .fromTo(intro, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 }, 0.95)
        // 3. The names arrive as one gentle wave. The plaques are collected HERE,
        //    at play time, so names that reached the API while the guest was
        //    reading elsewhere are introduced with the rest rather than appearing
        //    unannounced.
        .add(() => {
          revealedRef.current = true;
          setFreshNames([]);

          const plaques = find('.guests__plaque');
          if (!plaques.length) return;

          waveTween = gsap.fromTo(
            plaques,
            { opacity: 0, y: 18, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              stagger: 0.07,
              ease: 'power2.out',
              clearProps: 'transform',
            },
          );
        }, 1.05)
        .fromTo(signoff, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9 }, 1.5);

      cinematicOnPhones(tl);
    }, root);

    return () => {
      // The wave is created inside a callback, so the context does not own it.
      if (waveTween) waveTween.kill();
      ctx.revert();
    };
  }, []);

  const { wedding, format } = useI18n();
  const { guests: copy, names } = wedding;
  const count = guests.length;
  const showWall = status === 'ready' && count > 0;

  return (
    <section className="guests" ref={rootRef} aria-labelledby="guests-title">
      <span className="guests__halo" aria-hidden="true" />

      <header className="guests__header">
        <p className="guests__eyebrow">{copy.eyebrow}</p>

        <Divider className="guests__rule" />

        <h2 className="guests__title" id="guests-title">
          <span className="guests__title-mask">
            <span className="guests__title-inner">{copy.titleLead}</span>
          </span>{' '}
          <span className="guests__title-mask">
            <span className="guests__title-inner">
              <em>{copy.titleAccent}</em>
            </span>
          </span>
        </h2>

        <p className="guests__intro">{copy.intro}</p>
      </header>

      <div
        className="guests__stage guests__panel glass glass--panel glass-inset"
        ref={stageRef}
        data-expanded={expanded}
      >
        <span className="glass-grain" aria-hidden="true" />
        <CardOrnament kind="floret" />

        {status === 'loading' ? (
          <div className="guests__loading">
            <p className="guests__state-copy">{copy.loading}</p>
            <div className="guests__ghosts" aria-hidden="true">
              {LOADING_CAPSULES.map((capsule) => (
                <span className="guests__ghost" key={capsule} />
              ))}
            </div>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="guests__state" role="status">
            <p className="guests__state-copy">{copy.error}</p>
            <button className="guests__retry" type="button" onClick={retry}>
              {copy.retry}
            </button>
          </div>
        ) : null}

        {status === 'ready' && count === 0 ? (
          <div className="guests__state" role="status">
            <span className="guests__state-gem" aria-hidden="true" />
            <p className="guests__state-copy guests__state-copy--empty">
              {copy.empty}
            </p>
          </div>
        ) : null}

        {showWall ? (
          <div className="guests__clip" ref={clipRef}>
            <ul className="guests__wall" id="guests-wall" role="list" ref={wallRef}>
              {guests.map((name, index) => (
                <li
                  className="guests__plaque glass glass--panel"
                  key={`${name}-${index}`}
                  data-name={name}
                >
                  <span className="guests__plaque-gem" aria-hidden="true" />
                  <CardOrnament kind="speckle" />
                  <span className="guests__name">{name}</span>
                  <span className="guests__plaque-gem" aria-hidden="true" />
                </li>
              ))}
            </ul>

            {/* The names the fold is holding back dissolve into the panel. */}
            {foldable ? <span className="guests__fade" aria-hidden="true" /> : null}
          </div>
        ) : null}

        {showWall && foldable ? (
          <div className="guests__more">
            <button
              className="guests__toggle"
              type="button"
              aria-expanded={expanded}
              aria-controls="guests-wall"
              onClick={toggleFold}
            >
              <span className="guests__toggle-label">
                {expanded ? copy.showLess : format(copy.showAll, { count })}
              </span>
              <ChevronDown
                className="guests__toggle-icon"
                size={14}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>

      {/* The count is announced when it changes, never rendered as a metric. */}
      {showWall ? (
        <p className="guests__visually-hidden" role="status">
          {count === 1 ? copy.announceOne : `${count} ${copy.announceSuffix}`}
        </p>
      ) : null}

      <footer className="guests__footer">
        <Divider className="guests__rule" />

        <p className="guests__signoff">
          {copy.signoff}{' '}
          <span className="guests__signoff-names">
            {names.first} <em>&amp;</em> {names.second}
          </span>{' '}
          <span className="guests__heart" aria-hidden="true">
            &#9825;
          </span>
        </p>
      </footer>
    </section>
  );
}