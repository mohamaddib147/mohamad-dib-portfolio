// SignalBackground.jsx
// Canvas-based signal background with 7 unique drawing modes — one per section.
// Each variant has its own canvas drawing function reflecting the wireless motif.
//
// Props:
// - variant: "hero" | "about" | "tools" | "skills" | "projects" | "hire-me" | "contact"
// - projectType: (only for "projects" variant) "thesis" | "networking" | "iot" | "software"
// - className: optional extra class

import { useEffect, useRef } from "react";

// ─── Variant drawing functions ───────────────────────────────────────────────

// HERO — Carrier wave: a clean sine wave with an antenna pulse at the center top
function drawHero(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  // Subtle vertical grid lines (carrier reference)
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }

  // Ghost wave (trailing echo)
  ctx.beginPath();
  ctx.strokeStyle = "rgba(79,149,255,0.12)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= w; x += 2) {
    const y = h / 2 + Math.sin((x / w) * Math.PI * 6 + t * 0.6 - 0.3) * (h * 0.22);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Primary carrier wave
  ctx.beginPath();
  ctx.strokeStyle = "rgba(160,196,255,0.7)";
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(79,149,255,0.4)";
  for (let x = 0; x <= w; x += 2) {
    const y = h / 2 + Math.sin((x / w) * Math.PI * 6 + t * 0.6) * (h * 0.22);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Antenna pulse — radiating rings from top-center
  const ax = w / 2, ay = h * 0.12;
  [0.6, 0.35, 0.15].forEach((alpha, i) => {
    const r = 18 + i * 18 + ((t * 40) % 36);
    ctx.beginPath();
    ctx.arc(ax, ay, r, Math.PI, 0);
    ctx.strokeStyle = `rgba(79,149,255,${alpha * (1 - ((t * 40) % 36) / 36)})`;
    ctx.lineWidth = 1.5 - i * 0.4;
    ctx.stroke();
  });

  // Antenna mast
  ctx.beginPath();
  ctx.moveTo(ax, ay + 8); ctx.lineTo(ax, ay + 40);
  ctx.strokeStyle = "rgba(160,196,255,0.5)";
  ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#4f95ff";
  ctx.shadowBlur = 10; ctx.shadowColor = "#4f95ff";
  ctx.fill(); ctx.shadowBlur = 0;
}

// ABOUT — Routing grid: a network of nodes connected by dynamic routing paths
function drawAbout(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const nodes = [
    { x: w * 0.15, y: h * 0.25 }, { x: w * 0.42, y: h * 0.15 },
    { x: w * 0.72, y: h * 0.30 }, { x: w * 0.88, y: h * 0.60 },
    { x: w * 0.55, y: h * 0.70 }, { x: w * 0.25, y: h * 0.75 },
    { x: w * 0.08, y: h * 0.60 }, { x: w * 0.62, y: h * 0.48 },
  ];

  const edges = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,7],[7,4],[2,7],[7,5]
  ];

  // Draw edges
  edges.forEach(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    ctx.beginPath();
    ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
    ctx.strokeStyle = "rgba(100,160,255,0.18)";
    ctx.lineWidth = 1; ctx.stroke();
  });

  // Animated data packet traveling along edges
  const edgeIdx = Math.floor(t * 0.8) % edges.length;
  const [ea, eb] = edges[edgeIdx];
  const progress = (t * 0.8) % 1;
  const px = nodes[ea].x + (nodes[eb].x - nodes[ea].x) * progress;
  const py = nodes[ea].y + (nodes[eb].y - nodes[ea].y) * progress;

  ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#00c2ff";
  ctx.shadowBlur = 10; ctx.shadowColor = "#00c2ff"; ctx.fill(); ctx.shadowBlur = 0;

  // Draw nodes
  nodes.forEach((n, i) => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,149,255,0.2)";
    ctx.strokeStyle = "rgba(160,196,255,0.7)";
    ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#9ec5ff"; ctx.fill();
  });
}

// TOOLS — Spectrum field: animated frequency bars representing an RF scan
function drawTools(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const bars = 48;
  const barW = (w * 0.85) / bars;
  const startX = w * 0.075;
  const baseY = h * 0.78;

  // Frequency baseline
  ctx.beginPath();
  ctx.moveTo(startX - 4, baseY); ctx.lineTo(startX + bars * barW + 4, baseY);
  ctx.strokeStyle = "rgba(100,160,255,0.3)"; ctx.lineWidth = 1; ctx.stroke();

  for (let i = 0; i < bars; i++) {
    const freq = i / bars;
    const base = Math.sin(freq * Math.PI * 3) * 0.4
      + Math.sin(freq * Math.PI * 7.3 + 1.2) * 0.25
      + Math.sin(freq * Math.PI * 13 + t * 1.2) * 0.15
      + Math.random() * 0.05;
    const barH = Math.max(4, (0.5 + base * 0.5) * h * 0.55);

    const alpha = 0.4 + base * 0.5;
    ctx.fillStyle = `rgba(79,${120 + Math.floor(base * 76)},255,${alpha})`;
    ctx.shadowBlur = base > 0.5 ? 8 : 0;
    ctx.shadowColor = "rgba(79,149,255,0.5)";
    ctx.fillRect(startX + i * barW, baseY - barH, barW * 0.7, barH);
    ctx.shadowBlur = 0;
  }

  // Scan cursor
  const scanX = startX + ((t * 0.4 * barW * bars) % (barW * bars));
  ctx.beginPath();
  ctx.moveTo(scanX, h * 0.1); ctx.lineTo(scanX, baseY + 4);
  ctx.strokeStyle = "rgba(0,194,255,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();
}

// SKILLS — Modulation layers: 3 stacked sine waves at different frequencies
function drawSkills(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const layers = [
    { freq: 2, amp: 0.18, color: "rgba(79,149,255,0.55)", lw: 2.5, offset: 0 },
    { freq: 5, amp: 0.10, color: "rgba(0,194,255,0.40)", lw: 1.8, offset: 0.3 },
    { freq: 9, amp: 0.05, color: "rgba(160,196,255,0.30)", lw: 1.2, offset: 0.7 },
  ];

  layers.forEach(({ freq, amp, color, lw, offset }) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    const centerY = h / 2;
    for (let x = 0; x <= w; x += 2) {
      const y = centerY + Math.sin((x / w) * Math.PI * 2 * freq + t * 0.7 + offset) * (h * amp);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Modulation envelope outline
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);
  for (let x = 0; x <= w; x += 2) {
    const y = h / 2 - Math.abs(Math.sin((x / w) * Math.PI * 2 + t * 0.25)) * h * 0.32;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let x = 0; x <= w; x += 2) {
    const y = h / 2 + Math.abs(Math.sin((x / w) * Math.PI * 2 + t * 0.25)) * h * 0.32;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

// PROJECTS — thesis: Beamforming / RF arc visual
function drawProjectsThesis(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  const tx = w * 0.18, ty = h * 0.5;

  for (let i = 1; i <= 6; i++) {
    const r = i * (w * 0.12) + ((t * 30) % (w * 0.12));
    const alpha = Math.max(0, 0.5 - (r / (w * 0.9)) * 0.5);
    ctx.beginPath();
    ctx.arc(tx, ty, r, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.strokeStyle = `rgba(79,149,255,${alpha})`;
    ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx + w * 0.75, ty - h * 0.15);
  ctx.lineTo(tx + w * 0.75, ty + h * 0.15);
  ctx.closePath();
  ctx.fillStyle = "rgba(79,149,255,0.07)";
  ctx.strokeStyle = "rgba(160,196,255,0.3)"; ctx.lineWidth = 1;
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#4f95ff"; ctx.shadowBlur = 14; ctx.shadowColor = "#4f95ff";
  ctx.fill(); ctx.shadowBlur = 0;
}

// PROJECTS — networking: Packet route / network path
function drawProjectsNetworking(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const path = [
    { x: w * 0.08, y: h * 0.5 }, { x: w * 0.28, y: h * 0.25 },
    { x: w * 0.50, y: h * 0.60 }, { x: w * 0.72, y: h * 0.30 },
    { x: w * 0.92, y: h * 0.5 }
  ];

  for (let i = 0; i < path.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(path[i].x, path[i].y); ctx.lineTo(path[i+1].x, path[i+1].y);
    ctx.strokeStyle = "rgba(79,149,255,0.3)"; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);
  }

  const totalSteps = path.length - 1;
  const progress = (t * 0.5) % totalSteps;
  const seg = Math.min(Math.floor(progress), path.length - 2);
  const frac = progress - Math.floor(progress);
  const px = path[seg].x + (path[seg + 1].x - path[seg].x) * frac;
  const py = path[seg].y + (path[seg + 1].y - path[seg].y) * frac;

  ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#00c2ff"; ctx.shadowBlur = 12; ctx.shadowColor = "#00c2ff";
  ctx.fill(); ctx.shadowBlur = 0;

  path.forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100,160,255,0.25)"; ctx.strokeStyle = "rgba(160,196,255,0.7)";
    ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
  });
}

// PROJECTS — iot: Node topology / hub-and-spoke mesh
function drawProjectsIoT(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const hub = { x: w / 2, y: h / 2 };
  const count = 6;
  const sensorNodes = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + t * 0.15;
    return { x: hub.x + Math.cos(angle) * w * 0.30, y: hub.y + Math.sin(angle) * h * 0.35 };
  });

  sensorNodes.forEach(n => {
    ctx.beginPath(); ctx.moveTo(hub.x, hub.y); ctx.lineTo(n.x, n.y);
    ctx.strokeStyle = "rgba(79,149,255,0.22)"; ctx.lineWidth = 1; ctx.stroke();
  });

  const pingR = ((t * 60) % 90);
  ctx.beginPath(); ctx.arc(hub.x, hub.y, pingR, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0,194,255,${0.4 * (1 - pingR / 90)})`; ctx.lineWidth = 1.5; ctx.stroke();

  sensorNodes.forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,149,255,0.3)"; ctx.strokeStyle = "rgba(160,196,255,0.8)";
    ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
  });

  ctx.beginPath(); ctx.arc(hub.x, hub.y, 9, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(79,149,255,0.2)"; ctx.strokeStyle = "#9ec5ff"; ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(hub.x, hub.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#4f95ff"; ctx.shadowBlur = 12; ctx.shadowColor = "#4f95ff";
  ctx.fill(); ctx.shadowBlur = 0;
}

// PROJECTS — software: Protocol bars / signal trail
function drawProjectsSoftware(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const rows = 5;
  const rowH = h / (rows + 2);
  const speed = 0.3;

  for (let r = 0; r < rows; r++) {
    const y = rowH * (r + 1.2);
    const offset = (t * speed * (r % 2 === 0 ? 1 : -1) * 60) % w;
    const segments = 4 + r;
    const segW = w / segments;

    for (let s = 0; s < segments + 1; s++) {
      const sx = ((s * segW + offset) % (w + segW)) - segW * 0.1;
      const fillW = segW * 0.78;
      const alpha = 0.08 + (r / rows) * 0.18;
      const active = Math.floor((t * 2 + r) % segments) === s % segments;
      ctx.fillStyle = active
        ? `rgba(79,149,255,${alpha + 0.25})`
        : `rgba(79,149,255,${alpha})`;
      if (active) { ctx.shadowBlur = 8; ctx.shadowColor = "rgba(79,149,255,0.4)"; }
      ctx.fillRect(sx, y, fillW, rowH * 0.55);
      ctx.shadowBlur = 0;
    }
  }

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, rowH * 0.5, w * 0.12, rowH * 0.35);
  ctx.fillRect(w * 0.13, rowH * 0.5, w * 0.08, rowH * 0.35);
}

// HIRE ME — Stable link: flat strong connection between two endpoints
function drawHireMe(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const y = h / 2;
  const lx = w * 0.08, rx = w * 0.92;

  ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx, y);
  ctx.strokeStyle = "rgba(79,149,255,0.15)"; ctx.lineWidth = 8; ctx.stroke();

  ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx, y);
  ctx.strokeStyle = "rgba(160,196,255,0.7)"; ctx.lineWidth = 2.5;
  ctx.shadowBlur = 12; ctx.shadowColor = "rgba(79,149,255,0.45)"; ctx.stroke();
  ctx.shadowBlur = 0;

  const ticks = 8;
  for (let i = 0; i <= ticks; i++) {
    const tx = lx + (rx - lx) * (i / ticks);
    ctx.beginPath(); ctx.moveTo(tx, y - 8); ctx.lineTo(tx, y + 8);
    ctx.strokeStyle = "rgba(160,196,255,0.35)"; ctx.lineWidth = 1; ctx.stroke();
  }

  const px = lx + (rx - lx) * ((t * 0.4) % 1);
  ctx.beginPath(); ctx.arc(px, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#00c2ff"; ctx.shadowBlur = 14; ctx.shadowColor = "#00c2ff";
  ctx.fill(); ctx.shadowBlur = 0;

  [lx, rx].forEach(ex => {
    ctx.beginPath(); ctx.arc(ex, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,149,255,0.15)"; ctx.strokeStyle = "rgba(160,196,255,0.8)";
    ctx.lineWidth = 2; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(ex, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#4f95ff"; ctx.shadowBlur = 10; ctx.shadowColor = "#4f95ff";
    ctx.fill(); ctx.shadowBlur = 0;
  });
}

// CONTACT — Endpoint connection: two nodes reaching toward each other and linking
function drawContact(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const ly = h * 0.42, ry = h * 0.58;
  const lx = w * 0.12, rx = w * 0.88;
  const midX = w / 2, midY = (ly + ry) / 2;

  const linkT = (Math.sin(t * 0.5) + 1) / 2;

  const lEndX = lx + (midX - lx) * linkT;
  const lEndY = ly + (midY - ly) * linkT;
  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lEndX, lEndY);
  ctx.strokeStyle = "rgba(79,149,255,0.7)"; ctx.lineWidth = 2.5;
  ctx.shadowBlur = 10; ctx.shadowColor = "rgba(79,149,255,0.4)"; ctx.stroke(); ctx.shadowBlur = 0;

  const rEndX = rx + (midX - rx) * linkT;
  const rEndY = ry + (midY - ry) * linkT;
  ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rEndX, rEndY);
  ctx.strokeStyle = "rgba(0,194,255,0.7)"; ctx.lineWidth = 2.5;
  ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,194,255,0.4)"; ctx.stroke(); ctx.shadowBlur = 0;

  if (linkT > 0.95) {
    ctx.beginPath(); ctx.arc(midX, midY, 14 * linkT, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,194,255,${(linkT - 0.95) * 20 * 0.5})`;
    ctx.lineWidth = 2; ctx.stroke();
  }

  [[lx, ly, "#4f95ff"], [rx, ry, "#00c2ff"]].forEach(([nx, ny, color]) => {
    ctx.beginPath(); ctx.arc(nx, ny, 9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,149,255,0.15)"; ctx.strokeStyle = "rgba(160,196,255,0.8)";
    ctx.lineWidth = 2; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(nx, ny, 5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.shadowBlur = 12; ctx.shadowColor = color;
    ctx.fill(); ctx.shadowBlur = 0;
  });
}

// ─── Variant dispatcher ───────────────────────────────────────────────────────

const VARIANT_FN = {
  hero:      drawHero,
  about:     drawAbout,
  tools:     drawTools,
  skills:    drawSkills,
  "hire-me": drawHireMe,
  contact:   drawContact,
};

function getDrawFn(variant, projectType) {
  if (variant === "projects") {
    return {
      thesis:     drawProjectsThesis,
      networking: drawProjectsNetworking,
      iot:        drawProjectsIoT,
      software:   drawProjectsSoftware,
    }[projectType] ?? drawProjectsNetworking;
  }
  return VARIANT_FN[variant] ?? drawHero;
}

// ─── Component ────────────────────────────────────────────────────────────────

function SignalBackground({ variant = "hero", projectType = "networking", className = "" }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timeRef   = useRef(0);
  const lastRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const drawFn = getDrawFn(variant, projectType);

    function loop(ts) {
      if (lastRef.current !== null) {
        timeRef.current += (ts - lastRef.current) / 1000;
      }
      lastRef.current = ts;

      const p = canvas.parentElement;
      canvas.width  = p.offsetWidth;
      canvas.height = p.offsetHeight;

      drawFn(ctx, canvas.width, canvas.height, timeRef.current);
      animRef.current = requestAnimationFrame(loop);
    }

    const p = canvas.parentElement;
    canvas.width  = p.offsetWidth;
    canvas.height = p.offsetHeight;

    animRef.current = requestAnimationFrame(loop);

    const handleResize = () => {
      canvas.width  = p.offsetWidth;
      canvas.height = p.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      lastRef.current = null;
      timeRef.current = 0;
    };
  }, [variant, projectType]);

  return (
    <div className={`section-signal-canvas ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="signal-canvas-element" />
    </div>
  );
}

export default SignalBackground;
