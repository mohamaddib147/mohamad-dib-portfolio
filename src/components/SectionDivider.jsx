// SectionDivider.jsx
// Minimalist wireless-engineering divider between every section.
// Shows a fading horizontal line with a centered antenna/RF icon.

function SectionDivider() {
  return (
    <div className="rf-divider" role="separator" aria-hidden="true">
      {/* Fading line left */}
      <span className="rf-divider-line" />

      {/* Centered wireless icon: antenna with 3 radiating arcs */}
      <span className="rf-divider-icon">
        <svg
          width="28"
          height="22"
          viewBox="0 0 28 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outer arc */}
          <path
            d="M3 16 C3 8.268 8.268 2 14 2 C19.732 2 25 8.268 25 16"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Middle arc */}
          <path
            d="M7 16 C7 10.477 10.134 6 14 6 C17.866 6 21 10.477 21 16"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.60"
          />
          {/* Inner arc */}
          <path
            d="M10.5 16 C10.5 13.015 12.015 11 14 11 C15.985 11 17.5 13.015 17.5 16"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.90"
          />
          {/* Mast */}
          <line x1="14" y1="16" x2="14" y2="21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.80" />
          {/* Tip dot */}
          <circle cx="14" cy="2" r="1.5" fill="currentColor" opacity="0.70" />
        </svg>
      </span>

      {/* Fading line right */}
      <span className="rf-divider-line" />
    </div>
  );
}

export default SectionDivider;
