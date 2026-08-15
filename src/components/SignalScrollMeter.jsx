import { useEffect, useState } from "react";

// Four "chapters" mapped onto the site's sections, rendered as a literal WiFi
// glyph — a dot with three concentric arcs radiating outward/upward, exactly
// like a WiFi signal-strength icon (not the ascending-bars cellular icon).
// The dot is the innermost stop; each arc lights up as the reader scrolls
// further into the page.
const CHAPTERS = [
  { key: "intro", label: "Intro", targetId: "hero" },
  { key: "background", label: "Background", targetId: "about" },
  { key: "work", label: "Work", targetId: "projects" },
  { key: "connect", label: "Connect", targetId: "contact" },
];

// Hand-plotted concentric arcs, viewBox 0 0 24 24 — dot at (12, 21),
// arcs opening upward at radii 5 / 9.5 / 14, each spanning ±50° from
// vertical, spaced to leave clean gaps between each ring's hit area.
// Each ring gets its own hue — once all four are lit they'd otherwise
// blend into one indistinguishable cyan blob with no way to tell the
// rings apart.
const RINGS = [
  { type: "dot", cx: 12, cy: 21, r: 1.1, color: "#38bdf8" },
  { type: "arc", d: "M8.17 17.79 A5 5 0 0 1 15.83 17.79", color: "#2dd4bf" },
  { type: "arc", d: "M4.72 14.89 A9.5 9.5 0 0 1 19.28 14.89", color: "#60a5fa" },
  { type: "arc", d: "M1.28 12.00 A14 14 0 0 1 22.72 12.00", color: "#c084fc" },
];

function SignalScrollMeter() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      raf = 0;
      const viewportH = window.innerHeight;
      const anchor = viewportH * 0.35; // "current section" is whatever crosses this line

      let currentIdx = 0;
      for (let i = 0; i < CHAPTERS.length; i += 1) {
        const el = document.getElementById(CHAPTERS[i].targetId);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= anchor) currentIdx = i;
      }
      setActiveIdx(currentIdx);
      setVisible(window.scrollY > viewportH * 0.35);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const jumpTo = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleKeyDown = (e, targetId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      jumpTo(targetId);
    }
  };

  const displayedIdx = hoverIdx ?? activeIdx;

  return (
    <nav
      className={`signal-meter ${visible ? "is-visible" : ""}`}
      aria-label={`Page navigation. Currently viewing ${CHAPTERS[activeIdx].label}, section ${activeIdx + 1} of ${CHAPTERS.length}.`}
    >
      <span className="signal-meter-tooltip" aria-hidden="true">
        {CHAPTERS[displayedIdx].label}
      </span>

      <svg
        viewBox="0 0 24 24"
        className="signal-meter-glyph"
        aria-hidden="true"
        focusable="false"
      >
        {RINGS.map((ring, i) => {
          const chapter = CHAPTERS[i];
          const isLit = i <= activeIdx;
          const isActive = i === activeIdx;
          const isHovered = i === hoverIdx;
          const stateClass = `${isLit ? "is-lit" : ""} ${isActive ? "is-active" : ""} ${
            isHovered ? "is-hovered" : ""
          }`;

          if (ring.type === "dot") {
            return (
              <g key={chapter.key}>
                <circle
                  cx={ring.cx}
                  cy={ring.cy}
                  r={ring.r}
                  className={`signal-ring signal-ring-dot ${stateClass}`}
                  style={{ pointerEvents: "none", "--ring-color": ring.color }}
                />
                <circle
                  cx={ring.cx}
                  cy={ring.cy}
                  r={3.2}
                  fill="none"
                  className="signal-ring-hit"
                  role="button"
                  tabIndex={0}
                  aria-label={`Jump to ${chapter.label} section`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => jumpTo(chapter.targetId)}
                  onKeyDown={(e) => handleKeyDown(e, chapter.targetId)}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onFocus={() => setHoverIdx(i)}
                  onBlur={() => setHoverIdx(null)}
                />
              </g>
            );
          }

          return (
            <g key={chapter.key}>
              <path
                d={ring.d}
                className={`signal-ring signal-ring-arc ${stateClass}`}
                fill="none"
                style={{ pointerEvents: "none", "--ring-color": ring.color }}
              />
              <path
                d={ring.d}
                className="signal-ring-hit"
                fill="none"
                role="button"
                tabIndex={0}
                aria-label={`Jump to ${chapter.label} section`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => jumpTo(chapter.targetId)}
                onKeyDown={(e) => handleKeyDown(e, chapter.targetId)}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onFocus={() => setHoverIdx(i)}
                onBlur={() => setHoverIdx(null)}
              />
            </g>
          );
        })}
      </svg>
    </nav>
  );
}

export default SignalScrollMeter;
