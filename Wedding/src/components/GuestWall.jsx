import { useCallback, useEffect, useRef, useState } from 'react';

import { gsap } from '../lib/gsap';
import { cinematicOnPhones, revealStart } from '../lib/reveal.js';
import { useI18n } from '../i18n/index.jsx';
import {
  GUEST_REFRESH_MS,
  RSVP_ACCEPTED_EVENT,
  fetchAcceptedGuests,
} from '../config/guestsApi.js';
import { Divider } from './Ornaments.jsx';

/** The placeholder capsules the loading state breathes through. */
const LOADING_CAPSULES = [0, 1, 2, 3];

/**
 * Phase 19 — our beloved guests.
 *
 * A wall of the people who accepted, drawn from the public read-only endpoint.
 * It is deliberately NOT a panel like the RSVP's: the names themselves are the
 * composition, each set in its own small plaque on the burgundy ground, so the
 * section reads as a page of blessings rather than a list in a box.
 *
 * Three things keep it honest and quiet:
 *
 *   · the list refreshes on a slow interval (and on returning to the tab, and
 *     the instant a reply is stored) but re-renders ONLY when it truly changed,
 *     so an unchanged refresh costs nothing and replays nothing;
 *   · only genuinely new names animate - the rest of the wall is never touched;
 *   · a failure leaves the wall alone: names already on it stay, and only a wall
 *     that never loaded shows the retry line. The invitation never depends on
 *     this section.
 *
 * With `prefers-reduced-motion` the section renders complete and still.
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

  const [guests, setGuests] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  // Names that arrived since the last time the wall animated.
  const [freshNames, setFreshNames] = useState([]);

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

  const { wedding } = useI18n();
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

      <div className="guests__stage" ref={stageRef}>
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
          <ul className="guests__wall" role="list">
            {guests.map((name, index) => (
              <li
                className="guests__plaque glass glass--soft"
                key={`${name}-${index}`}
                data-name={name}
              >
                <span className="guests__plaque-gem" aria-hidden="true" />
                <span className="guests__name">{name}</span>
              </li>
            ))}
          </ul>
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