/**
 * Reveal choreography for the invitation's scroll animations.
 *
 * A reveal only reads if two things are right:
 *
 *   · **when it starts** — if it begins while the section is still hovering at
 *     the bottom edge, every beat plays out below the fold and the guest
 *     arrives at a finished, static composition;
 *   · **how long it takes** — the beats need enough room to be noticed one
 *     after another.
 *
 * Phones get a later start and a slower playback than the desktop, measured
 * against the same compact breakpoint the stylesheet uses. On desktop both
 * helpers return exactly what the components used before, so the desktop
 * experience is unchanged.
 */

const COMPACT_QUERY = '(max-width: 899.98px)';

/** How many percentage points later a reveal starts on a phone. */
const COMPACT_LEAD = 20;

/** Playback scale for reveal timelines on a phone (0.8 = 25% slower). */
const COMPACT_SCALE = 0.8;

/** True on phones and portrait tablets. */
export function isCompactViewport() {
  return window.matchMedia(COMPACT_QUERY).matches;
}

/**
 * The `start` for a reveal trigger.
 *
 * On desktop the percentage is returned untouched; on a phone the trigger is
 * held back so the section is properly on screen before its animation begins.
 *
 * @param {number} desktopPercent the percentage the desktop uses, e.g. `84`
 * @returns {string} a ScrollTrigger start such as `'top 84%'` or `'top 64%'`
 */
export function revealStart(desktopPercent) {
  const percent = isCompactViewport()
    ? desktopPercent - COMPACT_LEAD
    : desktopPercent;

  return `top ${percent}%`;
}

/**
 * Gives a reveal timeline a little more room on a phone.
 *
 * `timeScale` stretches every duration *and* every stagger in one go, so the
 * choreography keeps its shape and simply plays slower. Desktop timelines are
 * left at their natural speed.
 *
 * @template {gsap.core.Timeline | gsap.core.Tween} T
 * @param {T} animation
 * @returns {T} the same animation, for chaining
 */
export function cinematicOnPhones(animation) {
  if (animation && isCompactViewport()) animation.timeScale(COMPACT_SCALE);

  return animation;
}
