// Technologies — FFT Spectrum Analyzer
// Each tool owns a frequency cluster on the canvas.
// Hovering a card spikes that cluster's bars with a cyan glow bloom.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ── Tool data ─────────────────────────────────────────────────────────────
// icon: Simple Icons slug (https://cdn.simpleicons.org/{slug})
// fallback: 2-4 char monospace label when no SI icon exists
const TOOLS = [
  { name: "Python",     icon: "python" },
  { name: "MATLAB",     icon: null,      fallback: "MTB" },
  { name: "C / C++",    icon: "cplusplus" },
  { name: "Java",       icon: "java" },
  { name: "React",      icon: "react" },
  { name: "JavaScript", icon: "javascript" },
  { name: "HTML",       icon: "html5" },
  { name: "CSS",        icon: "css3" },
  { name: "Git",        icon: "git" },
  { name: "GitHub",     icon: "github" },
  { name: "TCP/IP",     icon: null,      fallback: "TCP" },
  { name: "DNS",        icon: null,      fallback: "DNS" },
  { name: "VPN",        icon: null,      fallback: "VPN" },
  { name: "Linux",      icon: "linux" },
];

// ── FFT Canvas ────────────────────────────────────────────────────────────
// Draws a real-time bar-FFT. Each tool maps to a cluster of bars.
// spikedRef holds the currently hovered cluster index (or -1).
function FFTCanvas({ spikedRef }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const N      = TOOLS.length;       // number of clusters
    const BARS   = 3;                  // bars per cluster
    const GAP    = 2;                  // px gap between bars
    const CGAP   = 8;                  // px gap between clusters
    const BAR_W  = 6;                  // bar width

    // Current heights (0-1) for every bar
    const heights = Array.from({ length: N * BARS }, () => Math.random() * 0.18 + 0.04);
    // Target heights
    const targets = [...heights];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function tick() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const spiked = spikedRef.current;

      // Update targets
      for (let c = 0; c < N; c++) {
        for (let b = 0; b < BARS; b++) {
          const i = c * BARS + b;
          if (c === spiked) {
            // Spike: each bar gets a slightly different random peak
            targets[i] = 0.72 + Math.random() * 0.28;
          } else {
            // Idle drift
            if (Math.random() < 0.04) {
              targets[i] = 0.04 + Math.random() * 0.22;
            }
          }
          // Lerp toward target
          const speed = c === spiked ? 0.18 : 0.06;
          heights[i] += (targets[i] - heights[i]) * speed;
        }
      }

      // Cluster block width
      const clusterW = BARS * BAR_W + (BARS - 1) * GAP;
      const totalW   = N * clusterW + (N - 1) * CGAP;
      let   x0       = (W - totalW) / 2;

      for (let c = 0; c < N; c++) {
        const isSpike = c === spiked;

        for (let b = 0; b < BARS; b++) {
          const i  = c * BARS + b;
          const h  = Math.max(2, heights[i] * H * 0.82);
          const x  = x0 + b * (BAR_W + GAP);
          const y  = H - h;

          // Glow on spiked cluster
          if (isSpike) {
            ctx.shadowColor = "rgba(56,189,248,0.85)";
            ctx.shadowBlur  = 18;
          } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur  = 0;
          }

          // Gradient fill: cyan top → dark blue bottom
          const grad = ctx.createLinearGradient(0, y, 0, H);
          if (isSpike) {
            grad.addColorStop(0,   "rgba(56,189,248,0.95)");
            grad.addColorStop(0.5, "rgba(56,189,248,0.55)");
            grad.addColorStop(1,   "rgba(14,50,80,0.20)");
          } else {
            grad.addColorStop(0,   "rgba(56,189,248,0.42)");
            grad.addColorStop(1,   "rgba(14,50,80,0.08)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, BAR_W, h, [2, 2, 0, 0]);
          ctx.fill();
        }

        // Cluster frequency label (tiny hz readout)
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = isSpike ? "rgba(56,189,248,0.75)" : "rgba(56,189,248,0.22)";
        ctx.font        = `bold 8px monospace`;
        ctx.textAlign   = "center";
        const labelX    = x0 + clusterW / 2;
        ctx.fillText(`${(c * 3.2 + 2.4).toFixed(1)}G`, labelX, H - 2);

        x0 += clusterW + CGAP;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    tick();
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [spikedRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        opacity: 0.72,
      }}
    />
  );
}

// ── Tool Card ─────────────────────────────────────────────────────────────
function ToolCard({ tool, index, onEnter, onLeave }) {
  const [imgErr, setImgErr] = useState(false);
  const iconUrl = tool.icon
    ? `https://cdn.simpleicons.org/${tool.icon}/38bdf8`
    : null;

  return (
    <motion.div
      className="tech-band"
      onMouseEnter={() => onEnter(index)}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.045 }}
      style={{ position: "relative", zIndex: 1 }}
    >
      {iconUrl && !imgErr ? (
        <img
          src={iconUrl}
          alt={tool.name}
          width={32}
          height={32}
          loading="lazy"
          className="tech-band-logo"
          onError={() => setImgErr(true)}
          style={{ filter: "none", opacity: 0.85 }}
        />
      ) : (
        <span className="tech-band-icon-fallback">
          {tool.fallback || tool.name.slice(0, 3).toUpperCase()}
        </span>
      )}
      <span className="tech-band-label">{tool.name}</span>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────
function Technologies() {
  const spikedRef = useRef(-1);

  return (
    <section
      id="technologies"
      className="portfolio-data-section technologies-section"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* FFT canvas — sits behind cards at z-index 0 */}
      <FFTCanvas spikedRef={spikedRef} />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Spectrum analyzer HUD header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <p className="section-kicker" style={{ margin: 0 }}>Spectrum Analyzer — Technologies</p>
          <span style={{
            padding: "3px 10px",
            borderRadius: 999,
            fontSize: "0.72rem",
            fontFamily: "monospace",
            fontWeight: 700,
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.22)",
            color: "#38bdf8",
            letterSpacing: "0.08em",
          }}>LIVE ●</span>
        </div>

        <h2>Core tools behind my engineering and development work.</h2>
        <p className="section-intro">
          Hover any frequency band to isolate and spike its signal.
          A multidisciplinary stack spanning software, simulation, networking, and security.
        </p>

        {/* Frequency axis label */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 4px",
          marginBottom: 8,
          fontSize: "0.7rem",
          fontFamily: "monospace",
          color: "rgba(56,189,248,0.35)",
          letterSpacing: "0.06em",
        }}>
          <span>2.4 GHz</span>
          <span>▸ FREQUENCY BAND ◂</span>
          <span>45.2 GHz</span>
        </div>

        <div className="tech-bands-grid">
          {TOOLS.map((tool, index) => (
            <ToolCard
              key={tool.name}
              tool={tool}
              index={index}
              onEnter={(i) => { spikedRef.current = i; }}
              onLeave={() => { spikedRef.current = -1; }}
            />
          ))}
        </div>

        {/* dBm axis */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 8,
          fontSize: "0.68rem",
          fontFamily: "monospace",
          color: "rgba(56,189,248,0.28)",
          letterSpacing: "0.06em",
        }}>
          <span>amplitude: dBm — hover to spike ↑</span>
        </div>
      </motion.div>
    </section>
  );
}

export default Technologies;
