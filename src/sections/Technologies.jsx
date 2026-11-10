// Technologies — spectrum allocation chart.
// Tools are grouped into named "bands" (like an RF allocation chart). Hovering,
// focusing or tapping a card spikes its cluster and lights the rest of its band.
// Icons are vendored cyan SVGs (src/assets/logos/si, mostly Simple Icons) — no CDN.

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Activity, Antenna, KeyRound, Radar, RadioTower, Route, ShieldCheck } from "lucide-react";

const si = import.meta.glob("../assets/logos/si/*.svg", { eager: true, import: "default" });
const icon = (slug) => si[`../assets/logos/si/${slug}.svg`];

const BANDS = [
  {
    name: "Wireless & RF",
    short: "RF",
    tools: [
      { name: "5G NR / LTE", Icon: RadioTower },
      { name: "MIMO / Beamforming", Icon: Antenna },
      { name: "Spectrum Analysis", Icon: Activity },
      { name: "RF Planning", Icon: Radar },
      { name: "MATLAB", src: icon("matlab") },
    ],
  },
  {
    name: "Networking & Security",
    short: "NET / SEC",
    tools: [
      { name: "Cisco", src: icon("cisco") },
      { name: "Fortinet", src: icon("fortinet") },
      { name: "Wireshark", src: icon("wireshark") },
      { name: "OSPF / BGP", Icon: Route },
      { name: "IPsec VPN", Icon: ShieldCheck },
      { name: "PKI / Zero Trust", Icon: KeyRound },
      { name: "Linux", src: icon("linux") },
    ],
  },
  {
    name: "Backend & Data",
    short: "BACKEND",
    tools: [
      { name: "Python", src: icon("python") },
      { name: "FastAPI", src: icon("fastapi") },
      { name: "Django", src: icon("django") },
      { name: "Node.js", src: icon("nodedotjs") },
      { name: "PostgreSQL", src: icon("postgresql") },
      { name: "Supabase", src: icon("supabase") },
      { name: "MongoDB", src: icon("mongodb") },
    ],
  },
  {
    name: "Frontend",
    short: "FRONTEND",
    tools: [
      { name: "React", src: icon("react") },
      { name: "Next.js", src: icon("nextdotjs") },
      { name: "TypeScript", src: icon("typescript") },
      { name: "JavaScript", src: icon("javascript") },
      { name: "HTML", src: icon("html5") },
      { name: "CSS", src: icon("css") },
    ],
  },
  {
    name: "Embedded & Tooling",
    short: "TOOLING",
    tools: [
      { name: "C / C++", src: icon("cplusplus") },
      { name: "Arduino", src: icon("arduino") },
      { name: "Java", src: icon("openjdk") },
      { name: "Git", src: icon("git") },
      { name: "GitHub", src: icon("github") },
      { name: "Jira", src: icon("jira") },
      { name: "Vitest", src: icon("vitest") },
    ],
  },
];

const TOOLS = BANDS.flatMap((band, b) => band.tools.map((t) => ({ ...t, band: b })));

// ── Spectrum canvas ───────────────────────────────────────────────────────
// Sits in its own block below the grid so spikes never run through text.
function SpectrumCanvas({ activeRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const N = TOOLS.length;
    const BARS = 4;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const heights = Array.from({ length: N * BARS }, () => Math.random() * 0.18 + 0.04);
    const targets = [...heights];
    let W = 0;
    let H = 0;
    let raf = 0;
    let visible = false;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const active = activeRef.current;
      const activeBand = active >= 0 ? TOOLS[active].band : -1;
      const axisY = H - 26;

      const sidePad = Math.max(10, W * 0.02);
      const clusterGap = Math.max(5, Math.min(14, W * 0.008));
      const innerGap = 2;
      const clusterW = (W - sidePad * 2 - clusterGap * (N - 1)) / N;
      const barW = Math.max(3, (clusterW - innerGap * (BARS - 1)) / BARS);

      let x0 = sidePad;
      const bandStart = [];

      for (let c = 0; c < N; c++) {
        const isSpike = c === active;
        const inBand = TOOLS[c].band === activeBand;
        if (c === 0 || TOOLS[c].band !== TOOLS[c - 1].band) bandStart.push(x0);

        for (let b = 0; b < BARS; b++) {
          const i = c * BARS + b;
          if (!reduceMotion) {
            if (isSpike) targets[i] = 0.8 + Math.random() * 0.2;
            else if (inBand) targets[i] = 0.35 + Math.random() * 0.2;
            else if (Math.random() < 0.035) targets[i] = 0.05 + Math.random() * 0.24;
            heights[i] += (targets[i] - heights[i]) * (isSpike || inBand ? 0.18 : 0.055);
          }

          const h = Math.max(2, heights[i] * (axisY - 6));
          const x = x0 + b * (barW + innerGap);
          const y = axisY - h;

          ctx.shadowColor = isSpike ? "rgba(56,189,248,0.9)" : "transparent";
          ctx.shadowBlur = isSpike ? 16 : 0;

          const grad = ctx.createLinearGradient(0, y, 0, axisY);
          const top = isSpike ? 0.98 : inBand ? 0.7 : 0.44;
          grad.addColorStop(0, `rgba(56,189,248,${top})`);
          grad.addColorStop(1, "rgba(14,50,80,0.08)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, h, [2, 2, 0, 0]);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        x0 += clusterW + clusterGap;
      }

      // Band allocation brackets + labels along the axis.
      ctx.font = "600 10px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let b = 0; b < BANDS.length; b++) {
        const start = bandStart[b];
        const end = b + 1 < BANDS.length ? bandStart[b + 1] - clusterGap : W - sidePad;
        const lit = b === activeBand;
        ctx.strokeStyle = lit ? "rgba(56,189,248,0.85)" : "rgba(56,189,248,0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(start, axisY + 5);
        ctx.lineTo(start, axisY + 10);
        ctx.lineTo(end, axisY + 10);
        ctx.lineTo(end, axisY + 5);
        ctx.stroke();
        ctx.fillStyle = lit ? "rgba(215,242,255,0.95)" : "rgba(56,189,248,0.5)";
        const full = BANDS[b].name.toUpperCase();
        const label = ctx.measureText(full).width > end - start - 8 ? BANDS[b].short : full;
        ctx.fillText(label, (start + end) / 2, axisY + 13);
      }
    }

    function tick() {
      draw();
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (reduceMotion || raf || !visible) return;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, [activeRef]);

  return <canvas ref={canvasRef} className="tech-spectrum" aria-hidden="true" />;
}

// ── Tool card ─────────────────────────────────────────────────────────────
function ToolCard({ tool, index, setActive }) {
  return (
    <motion.button
      type="button"
      className="tech-band"
      aria-label={`${tool.name} — ${BANDS[tool.band].name}`}
      onMouseEnter={() => setActive(index)}
      onMouseLeave={() => setActive(-1)}
      onFocus={() => setActive(index)}
      onBlur={() => setActive(-1)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
    >
      {tool.Icon ? (
        <tool.Icon size={32} strokeWidth={1.6} className="tech-band-logo" aria-hidden="true" />
      ) : (
        <img src={tool.src} alt="" width={32} height={32} loading="lazy" className="tech-band-logo" />
      )}
      <span className="tech-band-label">{tool.name}</span>
    </motion.button>
  );
}

// ── Section ───────────────────────────────────────────────────────────────
function Technologies() {
  const activeRef = useRef(-1);
  const setActive = (i) => {
    activeRef.current = i;
  };

  return (
    <section id="technologies" className="portfolio-data-section technologies-section">
      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="tech-kicker-row">
          <p className="section-kicker">Technologies</p>
          <span className="tech-live-pill">LIVE ●</span>
        </div>

        <h2>Core tools behind my engineering and development work.</h2>
        <p className="section-intro">
          Allocated by band, wireless first: the RF and networking stack from my
          communication-systems background, then the backend and frontend tools I
          ship with today. Hover or tap a tool to light up its band.
        </p>

        <div className="tech-bands-grid">
          {TOOLS.map((tool, index) => (
            <ToolCard key={tool.name} tool={tool} index={index} setActive={setActive} />
          ))}
        </div>

        <div className="tech-axis-row">
          <span>SPECTRUM ALLOCATION</span>
          <span>amplitude: dBm</span>
        </div>
        <SpectrumCanvas activeRef={activeRef} />
      </motion.div>
    </section>
  );
}

export default Technologies;
