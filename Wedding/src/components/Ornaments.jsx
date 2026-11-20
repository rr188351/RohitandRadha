/**
 * Small ornamental SVG pieces shared by the invitation.
 *
 * Every element here is decorative only and is therefore hidden from
 * assistive technology. Colours are inherited through `currentColor` so the
 * ornaments can be tinted with the gold tokens.
 */

/**
 * Delicate corner flourish. Rendered four times by the invitation card and
 * rotated with CSS so a single path set covers all four corners.
 *
 * @param {{
 *   position: 'tl' | 'tr' | 'br' | 'bl',
 *   className?: string,
 * }} props `className` is appended to the wrapper so other screens (e.g. the
 * hero) can reposition the same ornament without affecting the card.
 */
export function CornerOrnament({ position, className = '' }) {
  return (
    <span
      className={`corner corner--${position}${className ? ` ${className}` : ''}`}
    >
      <svg
        className="corner__art"
        viewBox="0 0 42 42"
        fill="none"
        aria-hidden="true"
        focusable="false"
        data-reveal="ornament"
      >
        <path
          d="M2 40V18A16 16 0 0 1 18 2h22"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />
        <path
          d="M7.5 40V18a10.5 10.5 0 0 1 10.5-10.5h20"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.28"
          strokeLinecap="round"
        />
        <path
          d="M8.6 6 11.2 8.6 8.6 11.2 6 8.6Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
      </svg>
    </span>
  );
}

/**
 * Centred ornamental rule: a hairline with dots and a small gold gem.
 *
 * @param {{ className?: string }} props `className` lets a screen widen or
 * narrow the rule without touching the card's own styling.
 */
export function Divider({ className = '' }) {
  return (
    <div
      className={`rule${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      data-reveal="rule"
    >
      <span className="rule__line" />
      <span className="rule__dot" />
      <span className="rule__gem" />
      <span className="rule__dot" />
      <span className="rule__line" />
    </div>
  );
}
