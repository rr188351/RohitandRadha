import { useEffect, useRef } from 'react';

import { registerGoldFrame } from '../lib/goldFrames.js';

/**
 * The invitation's gold frame.
 *
 * A separate inset layer rather than a border on the card itself: the card keeps
 * its own glass edge, padding and stacking untouched, and this layer draws the
 * premium gold ring exactly on top of that edge — `inset: 0` plus
 * `border-radius: inherit`, so it follows whatever rounding its host has (a
 * 12px plaque, a 4px gallery frame, the round music pill).
 *
 * Because it is only ever a hairline at the very rim, it can never sit on text,
 * buttons or photographs; the host's own padding keeps every piece of content
 * inside it. `overflow: hidden` clips the travelling light to the host's
 * rounded shape.
 *
 * @param {{
 *   tone?: 'gold' | 'rich',
 *   sweep?: boolean,
 *   className?: string,
 * }} props
 */
export default function GoldFrame({ tone = 'gold', sweep = false, className = '' }) {
  const frameRef = useRef(null);

  useEffect(() => registerGoldFrame(frameRef.current), []);

  const classes = [
    'gold-frame',
    `gold-frame--${tone}`,
    sweep ? 'gold-frame--sweep' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} ref={frameRef} aria-hidden="true">
      <i className="gold-frame__beam gold-frame__beam--top" />
      <i className="gold-frame__beam gold-frame__beam--right" />
      <i className="gold-frame__beam gold-frame__beam--bottom" />
      <i className="gold-frame__beam gold-frame__beam--left" />
    </span>
  );
}
