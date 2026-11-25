/**
 * Phase 22B — ornamental surfaces for the invitation's glass cards.
 *
 * Every card in the invitation is the same dark burgundy glass, so on a large
 * screen they read as flat panels. These layers put real ornamental artwork
 * back into the surfaces — a Mughal star lattice, drifting gold dust, botanical
 * vines, ornamental diagonals, miniature florals, a royal mandala, a geometric
 * trellis, flowing curves, gold speckle, a palace arch, a floral spray and a
 * filigree band — each drawn as inline SVG in the stylesheet and exposed here
 * as one attribute.
 *
 * Phase 22D gives every card a different member of that set (see section 34b of
 * main.css), so no two panels share a ground.
 *
 * They are decorative only: `aria-hidden`, `pointer-events: none`, and drawn
 * at `z-index: -1` inside the card, so an ornament can never sit on a name, a
 * line of copy or a button.
 *
 * @param {{
 *   kind:
 *     | 'mughal' | 'dust' | 'vine' | 'diagonal' | 'bloom'
 *     | 'mandala' | 'trellis' | 'wave' | 'speckle'
 *     | 'arch' | 'spray' | 'band' | 'crest',
 *   className?: string,
 * }} props
 */
export default function CardOrnament({ kind, className = '' }) {
  return (
    <span
      className={`card-orn card-orn--${kind}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  );
}

const CORNERS = ['tl', 'tr', 'br', 'bl'];

/**
 * The four ceremonial corner flourishes, as one decorative layer: a single
 * paisley-and-arc motif rotated into each corner by CSS. Used by the closing
 * letter and the RSVP, the two pages that open and close the reply.
 *
 * @param {{ className?: string }} props
 */
export function CardCornerArt({ className = '' }) {
  return (
    <span
      className={`card-orn-corners${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {CORNERS.map((position) => (
        <i key={position} className={`card-orn-corner card-orn-corner--${position}`} />
      ))}
    </span>
  );
}