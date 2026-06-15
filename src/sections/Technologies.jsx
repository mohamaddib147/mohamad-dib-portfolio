// Technologies — FFT Spectrum Analyzer
// Full-width spectrum canvas with responsive bar sizing.
// Uses Simple Icons for working logos and local SVGs for missing ones.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import cssLogo from "../assets/logos/css-3-svgrepo-com.svg";
import dnsLogo from "../assets/logos/dns-svgrepo-com.svg";
import javaLogo from "../assets/logos/java-svgrepo-com.svg";
import matlabLogo from "../assets/logos/matlab-svgrepo-com.svg";
import vpnLogo from "../assets/logos/vpn-svgrepo-com .svg";
import xmlLogo from "../assets/logos/xml-svgrepo-com.svg";

// ── Tool data ─────────────────────────────────────────────────────────────
// icon: Simple Icons slug when available
// localIcon: imported local SVG when CDN is unreliable/missing
// fallback: short monospace badge when no reliable logo is available
const TOOLS = [
  { name: "Python", icon: "python" },
  { name: "MATLAB", localIcon: matlabLogo, fallback: "MAT" },
  { name: "C / C++", icon: "cplusplus" },
  { name: "Java", localIcon: javaLogo, fallback: "JAVA" },
  { name: "React", icon: "react" },
  { name: "JavaScript", icon: "javascript" },
  { name: "HTML", icon: "html5" },
  { name: "CSS", localIcon: cssLogo, fallback: "CSS" },
  { name: "Flutter", icon: "flutter" },
  { name: "XML", localIcon: xmlLogo, fallback: "XML" },
  { name: "Git", icon: "git" },
  { name: "GitHub", icon: "github" },
  { name: "TCP/IP", localIcon: dnsLogo, fallback: "TCP" },
  { name: "DNS", localIcon: dnsLogo, fallback: "DNS" },
  { name: "VPN", localIcon: vpnLogo, fallback: "VPN" },
  { name: "Linux", icon: "linux" },
];

// ── FFT Canvas ────────────────────────────────────────────────────────────
// Draws a full-width responsive spectrum.
// Each tool owns one cluster, and each cluster expands to fill the canvas width.
function FFTCanvas({ spikedRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const N = TOOLS.length;
    const BARS = 4;

    const heights = Array.from({ length: N * BARS }, () => Math.random() * 0.18 + 0.04);
    const targets = [...heights];

    function resize() {
      canvas.width = canvas.offsetWidth;
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

      for (let c = 0; c < N; c++) {
        for (let b = 0; b < BARS; b++) {
          const i = c * BARS + b;

          if (c === spiked) {
            targets[i] = 0.72 + Math.random() * 0.28;
          } else if (Math.random() < 0.035) {
            targets[i] = 0.05 + Math.random() * 0.24;
          }

          const speed = c === spiked ? 0.18 : 0.055;
          heights[i] += (targets[i] - heights[i]) * speed;
        }
      }

      const sidePad = Math.max(10, W * 0.02);
      const clusterGap = Math.max(6, Math.min(16, W * 0.008));
      const innerGap = 2;
      const usableW = W - sidePad * 2 - clusterGap * (N - 1);
      const clusterW = usableW / N;
      const barW = Math.max(4, (clusterW - innerGap * (BARS - 1)) / BARS);

      let x0 = sidePad;

      for (let c = 0; c < N; c++) {
        const isSpike = c === spiked;

        for (let b = 0; b < BARS; b++) {
          const i = c * BARS + b;
          const h = Math.max(2, heights[i] * H * 0.8);
          const x = x0 + b * (barW + innerGap);
          const y = H - h - 14;

          if (isSpike) {
            ctx.shadowColor = "rgba(56,189,248,0.9)";
            ctx.shadowBlur = 18;
          } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          }

          const grad = ctx.createLinearGradient(0, y, 0, H);
          if (isSpike) {
            grad.addColorStop(0, "rgba(56,189,248,0.98)");
            grad.addColorStop(0.45, "rgba(56,189,248,0.60)");
            grad.addColorStop(1, "rgba(14,50,80,0.18)");
          } else {
            grad.addColorStop(0, "rgba(56,189,248,0.44)");
            grad.addColorStop(1, "rgba(14,50,80,0.08)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, h, [2, 2, 0, 0]);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = isSpike ? "rgba(56,189,248,0.78)" : "rgba(56,189,248,0.24)";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${(c * 2.9 + 2.4).toFixed(1)}G`, x0 + clusterW / 2, H - 2);

        x0 += clusterW + clusterGap;
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

  const iconUrl = tool.localIcon
    ? tool.localIcon
    : tool.icon
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
      transition={{ duration: 0.4, delay: index * 0.04 }}
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
          style={{ filter: "none", opacity: 0.9 }}
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
      <FFTCanvas spikedRef={spikedRef} />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <p className="section-kicker" style={{ margin: 0 }}>
            Technologies
          </p>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: "0.72rem",
              fontFamily: "monospace",
              fontWeight: 700,
              background: "rgba(56,189,248,0.08)",
              border: "1px solid rgba(56,189,248,0.22)",
              color: "#38bdf8",
              letterSpacing: "0.08em",
            }}
          >
            LIVE ●
          </span>
        </div>

        <h2>Core tools behind my engineering and development work.</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 4px",
            marginBottom: 8,
            fontSize: "0.7rem",
            fontFamily: "monospace",
            color: "rgba(56,189,248,0.35)",
            letterSpacing: "0.06em",
          }}
        >
          <span>2.4 GHz</span>
          <span>▸ FREQUENCY BAND ◂</span>
          <span>48.8 GHz</span>
        </div>

        <div className="tech-bands-grid">
          {TOOLS.map((tool, index) => (
            <ToolCard
              key={tool.name}
              tool={tool}
              index={index}
              onEnter={(i) => {
                spikedRef.current = i;
              }}
              onLeave={() => {
                spikedRef.current = -1;
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 8,
            fontSize: "0.68rem",
            fontFamily: "monospace",
            color: "rgba(56,189,248,0.28)",
            letterSpacing: "0.06em",
          }}
        >
          <span>amplitude: dBm — hover to spike ↑</span>
        </div>
      </motion.div>
    </section>
  );
}

export default Technologies;