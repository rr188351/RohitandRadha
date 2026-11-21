/**
 * The invitation's outer frame.
 *
 * A single transparent overlay pinned to the viewport: two hairline gold rules,
 * a sparse embroidered repeat along each edge, an ornate filigree corner in each
 * of the four corners, and a light that drifts slowly around the border.
 *
 * It is decoration only. There is no fill of any kind — every pixel between the
 * rules is the website itself — the whole layer is `pointer-events: none`, and
 * it sits above the page but *below* the floating controls (z-index 40 against
 * their 60), so the music pill and the auto-scroll capsule are never covered.
 *
 * The corner is drawn once, anchored at its own top-left, and the other three
 * are mirrored copies — the symmetry a printed invitation would have.
 */

const CORNERS = ['tl', 'tr', 'bl', 'br'];

/** One vine — drawn along the top edge, then mirrored across the diagonal. */
function Vine() {
  return (
    <>
      <path
        d="M68 50C92 36 120 32 150 34"
        stroke="url(#rf-gold)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M70 58C94 44 120 40 148 42"
        stroke="url(#rf-gold-soft)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      <g fill="url(#rf-gold)" stroke="rgba(58, 16, 29, 0.3)" strokeWidth="0.5">
        <path d="M88 40c6-11 16-16 26-16-5 11-15 16-26 16Z" opacity="0.9" />
        <path d="M116 35c6-10 15-14 24-14-5 10-14 14-24 14Z" opacity="0.7" />
        <path d="M100 46c-4 10-11 15-20 16 4-10 11-15 20-16Z" opacity="0.55" />
      </g>

      {/* The paisley that finishes the vine. */}
      <path
        d="M150 34c13-6 27 0 28 11 1 8-7 13-14 9-6-3-5-12 3-14"
        stroke="url(#rf-gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M152 41c8-3 15 1 16 7"
        stroke="url(#rf-gold-soft)"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />

      <g fill="url(#rf-gold)">
        <circle cx="79" cy="47" r="1.7" opacity="0.8" />
        <circle cx="106" cy="39" r="1.5" opacity="0.65" />
        <circle cx="130" cy="36" r="1.3" opacity="0.55" />
      </g>
    </>
  );
}

function CornerFiligree() {
  return (
    <svg
      className="royal-frame__art"
      viewBox="0 0 200 200"
      fill="none"
      focusable="false"
    >
      <defs>
        <linearGradient id="rf-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7ead0" />
          <stop offset="0.32" stopColor="#e5c992" />
          <stop offset="0.66" stopColor="#c5a46d" />
          <stop offset="1" stopColor="#9b7b49" />
        </linearGradient>
        <linearGradient id="rf-gold-soft" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#c5a46d" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#e5c992" stopOpacity="0.95" />
          <stop offset="1" stopColor="#c5a46d" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* The filigree fan that fills the corner behind the vines. */}
      <g className="royal-frame__fine" stroke="url(#rf-gold-soft)" fill="none">
        <path d="M66 66c16 6 26 16 30 32" strokeWidth="0.9" />
        <path d="M62 78c14 6 22 14 26 28" strokeWidth="0.8" />
        <path d="M78 62c6 14 14 22 28 26" strokeWidth="0.8" />
        <path d="M74 92c12 4 18 10 22 22" strokeWidth="0.6" />
        <path d="M92 74c4 12 10 18 22 22" strokeWidth="0.6" />
      </g>

      <Vine />
      <g transform="matrix(0 1 1 0 0 0)">
        <Vine />
      </g>

      {/* The rosette on the corner itself, above both vines. */}
      <g transform="translate(54 54)">
        <g fill="url(#rf-gold)" stroke="rgba(58, 16, 29, 0.28)" strokeWidth="0.5">
          <ellipse cx="0" cy="-14" rx="4.6" ry="9.6" />
          <ellipse cx="0" cy="-14" rx="4.6" ry="9.6" transform="rotate(45)" />
          <ellipse cx="0" cy="-14" rx="4.6" ry="9.6" transform="rotate(90)" />
          <ellipse cx="0" cy="-14" rx="4.6" ry="9.6" transform="rotate(135)" />
          <ellipse cx="0" cy="-14" rx="4.6" ry="9.6" transform="rotate(180)" />
          <ellipse cx="0" cy="-14" rx="4.6" ry="9.6" transform="rotate(225)" />
          <ellipse cx="0" cy="-14" rx="4.6" ry="9.6" transform="rotate(270)" />
          <ellipse cx="0" cy="-14" rx="4.6" ry="9.6" transform="rotate(315)" />
        </g>
        <circle r="4.4" fill="url(#rf-gold)" />
        <circle r="1.9" fill="#3a101d" opacity="0.5" />
        <circle r="6.6" stroke="url(#rf-gold-soft)" strokeWidth="0.6" fill="none" />
      </g>

      {/* Pearls and a pair of diamonds along the diagonal. */}
      <g fill="url(#rf-gold)">
        <circle cx="96" cy="96" r="1.8" opacity="0.6" />
        <circle cx="116" cy="116" r="1.5" opacity="0.45" />
      </g>
      <g className="royal-frame__fine">
        <path d="M132 132l5 5-5 5-5-5z" stroke="url(#rf-gold-soft)" strokeWidth="0.9" fill="none" />
        <path d="M150 150l4 4-4 4-4-4z" stroke="url(#rf-gold-soft)" strokeWidth="0.8" fill="none" />
      </g>
    </svg>
  );
}

export default function ViewportFrame() {
  return (
    <div className="royal-frame" aria-hidden="true">
      <span className="royal-frame__rule royal-frame__rule--outer" />
      <span className="royal-frame__rule royal-frame__rule--inner" />

      <span className="royal-frame__repeat royal-frame__repeat--top" />
      <span className="royal-frame__repeat royal-frame__repeat--bottom" />
      <span className="royal-frame__repeat royal-frame__repeat--left" />
      <span className="royal-frame__repeat royal-frame__repeat--right" />

      <span className="royal-frame__shine royal-frame__shine--top" />
      <span className="royal-frame__shine royal-frame__shine--right" />
      <span className="royal-frame__shine royal-frame__shine--bottom" />
      <span className="royal-frame__shine royal-frame__shine--left" />

      {CORNERS.map((corner) => (
        <span
          className={`royal-frame__corner royal-frame__corner--${corner}`}
          key={corner}
        >
          <CornerFiligree />
        </span>
      ))}
    </div>
  );
}
