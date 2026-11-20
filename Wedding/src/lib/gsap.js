/**
 * Central GSAP setup.
 *
 * Import GSAP from this module so plugins are registered once and shared
 * across every component:
 *
 *   import { gsap, ScrollTrigger } from '../lib/gsap';
 *
 * Additional cinematic plugins (SplitText, Flip, etc.) can be registered here
 * when they are needed.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Adds a `fromTo` to a timeline only when its targets actually exist.
 *
 * A few elements are rendered conditionally: the logistics blocks from
 * `EventDetails` only appear once real wedding details are filled into
 * `src/config/wedding.js`, and the ceremony alone carries a glass frame. When
 * one of those is absent, `gsap.utils.toArray` returns an empty list, and GSAP
 * reports `GSAP target  not found` for **both** `[]` and `null` (it normalises
 * either to zero targets inside the Tween constructor and warns). So an absent
 * element cannot be passed straight through — the tween itself has to be
 * skipped, which is what this helper does.
 *
 * Entries keep their absolute timeline positions, so skipping one never shifts
 * the timing of the others.
 *
 * @param {gsap.core.Timeline} timeline timeline to append to
 * @param {number} position absolute position on that timeline
 * @param {Element[]} targets result of `gsap.utils.toArray(...)`
 * @param {object} fromVars start values
 * @param {object} toVars end values
 * @returns {gsap.core.Timeline} the same timeline, for further chaining
 */
export function fromToIf(timeline, position, targets, fromVars, toVars) {
  if (!timeline || !targets || targets.length === 0) return timeline;

  return timeline.fromTo(targets, fromVars, toVars, position);
}

export { gsap, ScrollTrigger };
