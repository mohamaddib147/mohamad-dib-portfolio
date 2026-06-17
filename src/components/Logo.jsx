/**
 * Logo — wireless signal mark
 *
 * An "M" letterform with 3 concentric signal arcs radiating
 * from the top-right, built as a pure inline SVG.
 * Monochrome by default (currentColor) so it adapts to any
 * parent colour. Pass `size` to scale it.
 */
function Logo({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mohamad Dib logo"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* ── Signal arcs (top-right origin, centre ≈ 26,10) ── */}
      {/* Arc 1 — closest */}
      <path
        d="M 20.5 10.5 A 6 6 0 0 1 26.5 16.5"
        stroke="#38bdf8"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      {/* Arc 2 — mid */}
      <path
        d="M 18.5 7.5 A 9 9 0 0 1 29.5 18.5"
        stroke="#38bdf8"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Arc 3 — outer */}
      <path
        d="M 16.5 4.5 A 12.5 12.5 0 0 1 32.5 21"
        stroke="#38bdf8"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* ── M letterform ── */}
      {/* Left vertical leg */}
      <line
        x1="4" y1="28"
        x2="4" y2="10"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Left diagonal (down to valley) */}
      <line
        x1="4" y1="10"
        x2="13" y2="21"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right diagonal (up from valley) */}
      <line
        x1="13" y1="21"
        x2="22" y2="10"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right vertical leg */}
      <line
        x1="22" y1="10"
        x2="22" y2="28"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* ── Signal dot (node at arc origin) ── */}
      <circle cx="26" cy="10" r="2" fill="#38bdf8" opacity="1" />
    </svg>
  );
}

export default Logo;
