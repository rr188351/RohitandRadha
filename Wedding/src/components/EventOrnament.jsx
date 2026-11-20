/**
 * Three decorative motifs — one per celebration — so each event carries its own
 * visual personality while sharing the same fine gold line language.
 *
 * They are purely decorative and hidden from assistive technology. Colour is
 * inherited through `currentColor`, which each event theme tints.
 */

const RAY_ANGLES = Array.from({ length: 16 }, (_, index) => index * 22.5);
const LEAF_ROWS = [88, 69, 50, 31];

/* Haldi — a sun rosette of alternating rays. */
function SunRosette() {
  return (
    <>
      <circle
        cx="60"
        cy="60"
        r="38"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
        strokeDasharray="1.5 7"
      />
      <circle
        cx="60"
        cy="60"
        r="13"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        {RAY_ANGLES.map((angle, index) => (
          <path
            key={angle}
            d={index % 2 === 0 ? 'M60 24 L60 44' : 'M60 30 L60 44'}
            strokeOpacity={index % 2 === 0 ? 0.45 : 0.22}
            transform={`rotate(${angle} 60 60)`}
          />
        ))}
      </g>
      <circle cx="60" cy="60" r="3.4" fill="currentColor" fillOpacity="0.7" />
    </>
  );
}

/* Mehendi — a botanical sprig with paired leaves and a bud. */
function BotanicalSprig() {
  return (
    <>
      <path
        d="M60 110 C60 84 60 58 60 16"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {LEAF_ROWS.map((y) => (
        <g key={y}>
          <path
            d={`M60 ${y} C47 ${y - 3} 39 ${y - 11} 38 ${y - 20} C50 ${y - 18} 57 ${y - 9} 60 ${y} Z`}
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeOpacity="0.42"
            strokeWidth="1"
          />
          <path
            d={`M60 ${y} C73 ${y - 3} 81 ${y - 11} 82 ${y - 20} C70 ${y - 18} 63 ${y - 9} 60 ${y} Z`}
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeOpacity="0.42"
            strokeWidth="1"
          />
        </g>
      ))}
      <path
        d="M60 12 C55 17 55 24 60 29 C65 24 65 17 60 12 Z"
        fill="currentColor"
        fillOpacity="0.24"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      <circle cx="60" cy="36" r="2.2" fill="currentColor" fillOpacity="0.5" />
    </>
  );
}

/* Wedding Ceremony — a palace arch with a jewel, the grandest of the three. */
function PalaceArch() {
  return (
    <>
      <path
        d="M22 110 V56 C22 30 39 12 60 12 C81 12 98 30 98 56 V110"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M32 110 V58 C32 38 44 24 60 24 C76 24 88 38 88 58 V110"
        stroke="currentColor"
        strokeOpacity="0.26"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M14 110 H106"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path d="M60 42 L66.5 50 L60 58 L53.5 50 Z" fill="currentColor" fillOpacity="0.55" />
      <circle cx="60" cy="7" r="2.4" fill="currentColor" fillOpacity="0.55" />
      <circle cx="24" cy="104" r="1.8" fill="currentColor" fillOpacity="0.35" />
      <circle cx="96" cy="104" r="1.8" fill="currentColor" fillOpacity="0.35" />
    </>
  );
}

const MOTIFS = {
  haldi: SunRosette,
  mehendi: BotanicalSprig,
  wedding: PalaceArch,
};

/**
 * @param {{ theme: 'haldi' | 'mehendi' | 'wedding', className?: string }} props
 */
export default function EventOrnament({ theme, className = '' }) {
  const Motif = MOTIFS[theme] ?? SunRosette;

  return (
    <svg
      className={`event-ornament${className ? ` ${className}` : ''}`}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <Motif />
    </svg>
  );
}
