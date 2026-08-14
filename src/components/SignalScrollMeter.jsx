import { useEffect, useState } from "react";

// Five "chapters" mapped onto the eight page sections. Each bar in the WiFi
// meter represents one chapter — click a bar to jump, hover to see the label.
const CHAPTERS = [
  { key: "intro", label: "Intro", targetId: "hero" },
  { key: "background", label: "Background", targetId: "about" },
  { key: "skills", label: "Skills", targetId: "technologies" },
  { key: "work", label: "Work", targetId: "projects" },
  { key: "connect", label: "Connect", targetId: "contact" },
];

function SignalScrollMeter() {
  const [activeIdx, setActiveIdx] = useState(0);
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

  return (
    <nav
      className={`signal-meter ${visible ? "is-visible" : ""}`}
      aria-label={`Page navigation. Currently viewing ${CHAPTERS[activeIdx].label}, section ${activeIdx + 1} of ${CHAPTERS.length}.`}
    >
      <ul className="signal-meter-bars">
        {CHAPTERS.map((chapter, i) => {
          const isLit = i <= activeIdx;
          const isActive = i === activeIdx;
          return (
            <li key={chapter.key} className="signal-meter-item">
              <button
                type="button"
                onClick={() => jumpTo(chapter.targetId)}
                className={`signal-meter-bar signal-meter-bar--${i + 1} ${
                  isLit ? "is-lit" : ""
                } ${isActive ? "is-active" : ""}`}
                aria-label={`Jump to ${chapter.label} section`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="signal-meter-tooltip" aria-hidden="true">
                  {chapter.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default SignalScrollMeter;
