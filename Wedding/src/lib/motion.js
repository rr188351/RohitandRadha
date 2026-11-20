/**
 * The invitation's card motion.
 *
 * Every panel on the site enters through the same language: it starts a little
 * further away, a touch lower (or off to the side it belongs to), very slightly
 * turned, and settles with the same easing. Positions and durations vary a
 * little by composition, so nothing feels stamped out, but the vocabulary is
 * shared — which is what makes the whole invitation read as one film.
 *
 * `clearProps: 'transform'` at the end of a reveal hands the element back to
 * the stylesheet/hover system, so a settled card can lift without fighting a
 * leftover inline transform.
 */
import { gsap } from './gsap.js';

/** The house easing for anything arriving on screen. */
export const CARD_EASE = 'power3.out';

/** How long a panel takes to settle. */
export const CARD_DURATION = 1.15;

/** Media the hover polish is allowed in. */
const HOVER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Where a panel starts from — centred or slightly offset.
 *
 * @param {{x?: number, y?: number, scale?: number, rotate?: number,
 *          origin?: string}} [options]
 */
export function cardFrom({
  x = 0,
  y = 34,
  scale = 0.975,
  rotate = 0,
  origin = 'center center',
} = {}) {
  return { opacity: 0, x, y, scale, rotate, transformOrigin: origin };
}

/**
 * Where it settles: perfectly placed, axis-aligned and facing the guest.
 *
 * @param {{duration?: number, ease?: string}} [options]
 */
export function cardTo({ duration = CARD_DURATION, ease = CARD_EASE } = {}) {
  return {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    duration,
    ease,
    clearProps: 'transform',
  };
}

/**
 * The same entrance, leaning in from the side the card belongs to. The tilt is
 * deliberately tiny — a degree of rotation reads as depth, more reads as a
 * circus.
 *
 * @param {'left'|'right'} side
 * @param {{x?: number, y?: number, scale?: number, rotate?: number}} [options]
 */
export function sideCardFrom(side, options = {}) {
  const direction = side === 'right' ? 1 : -1;

  return cardFrom({
    x: 44 * direction,
    y: 26,
    scale: 0.972,
    rotate: -0.5 * direction,
    ...options,
  });
}

/**
 * The hover lift, for desktop pointers only.
 *
 * The transform is tweened by GSAP (so it can never collide with a CSS
 * transition), while the border and shadow shift through a class the
 * stylesheet owns. Touch devices and reduced-motion guests get nothing at all:
 * no listeners are even attached.
 *
 * @param {Element|Element[]|null} trigger the element the pointer has to enter
 * @param {Element|Element[]} [targets] what rises (defaults to the trigger)
 * @param {{lift?: number, scale?: number, tilt?: number, axis?: 'x'|'y'}} [options]
 * @returns {() => void} detaches everything it attached
 */
export function attachCardHover(trigger, targets = trigger, options = {}) {
  const triggers = (Array.isArray(trigger) ? trigger : [trigger]).filter(Boolean);
  const lifts = (Array.isArray(targets) ? targets : [targets]).filter(Boolean);

  if (!triggers.length || !lifts.length) return () => {};
  if (!window.matchMedia(HOVER_QUERY).matches) return () => {};
  if (window.matchMedia(REDUCED_QUERY).matches) return () => {};

  const { lift = -7, scale = 1.004, tilt = 1.1, axis = 'x' } = options;

  const rise = {
    y: lift,
    scale,
    rotateX: axis === 'x' ? tilt : 0,
    rotateY: axis === 'y' ? tilt : 0,
    transformPerspective: 1400,
    duration: 0.55,
    ease: 'power2.out',
    overwrite: 'auto',
  };

  const settleBack = {
    y: 0,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    duration: 0.5,
    ease: 'power2.out',
    overwrite: 'auto',
  };

  const enter = () => {
    lifts.forEach((el) => {
      el.classList.add('is-lifted');
      gsap.to(el, rise);
    });
  };

  const leave = () => {
    lifts.forEach((el) => {
      el.classList.remove('is-lifted');
      gsap.to(el, settleBack);
    });
  };

  triggers.forEach((el) => {
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
  });

  return () => {
    triggers.forEach((el) => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    });
    lifts.forEach((el) => {
      el.classList.remove('is-lifted');
      gsap.killTweensOf(el);
    });
  };
}
