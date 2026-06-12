// SignalBackground.jsx
// Canvas-based signal background — one unique wireless motif per section.
//
// Props:
//   variant:     "hero" | "about" | "tools" | "skills" | "projects" | "hire-me" | "contact"
//   projectType: (projects only) "thesis" | "networking" | "iot" | "software"
//   className:   optional extra CSS class

import { useEffect, useRef } from "react";

// ─── HERO — carrier wave + antenna pulse ─────────────────────────────────────
function drawHero(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  // Ghost echo wave
  ctx.beginPath();
  ctx.strokeStyle = "rgba(79,149,255,0.10)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= w; x += 2) {
    const y = h / 2 + Math.sin((x / w) * Math.PI * 6 + t * 0.6 - 0.3) * (h * 0.22);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Primary carrier wave
  ctx.beginPath();
  ctx.strokeStyle = "rgba(140,186,255,0.65)";
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(79,149,255,0.4)";
  for (let x = 0; x <= w; x += 2) {
    const y = h / 2 + Math.sin((x / w) * Math.PI * 6 + t * 0.6) * (h * 0.22);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Antenna pulse rings
  const ax = w / 2, ay = h * 0.12;
  [0.55, 0.32, 0.14].forEach((alpha, i) => {
    const r = 18 + i * 18 + ((t * 40) % 36);
    const fade = 1 - ((t * 40) % 36) / 36;
    ctx.beginPath();
    ctx.arc(ax, ay, r, Math.PI, 0);
    ctx.strokeStyle = `rgba(79,149,255,${alpha * fade})`;
    ctx.lineWidth = 1.5 - i * 0.4;
    ctx.stroke();
  });
  // Mast
  ctx.beginPath(); ctx.moveTo(ax, ay + 8); ctx.lineTo(ax, ay + 40);
  ctx.strokeStyle = "rgba(140,186,255,0.5)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#4f95ff"; ctx.shadowBlur = 10; ctx.shadowColor = "#4f95ff"; ctx.fill(); ctx.shadowBlur = 0;
}

// ─── ABOUT — routing grid with animated packet ────────────────────────────────
function drawAbout(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  const nodes = [
    { x: w * 0.15, y: h * 0.25 }, { x: w * 0.42, y: h * 0.15 },
    { x: w * 0.72, y: h * 0.30 }, { x: w * 0.88, y: h * 0.60 },
    { x: w * 0.55, y: h * 0.70 }, { x: w * 0.25, y: h * 0.75 },
    { x: w * 0.08, y: h * 0.60 }, { x: w * 0.62, y: h * 0.48 },
  ];
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,7],[7,4],[2,7],[7,5]];

  edges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y);
    ctx.strokeStyle = "rgba(100,160,255,0.16)"; ctx.lineWidth = 1; ctx.stroke();
  });

  const edgeIdx = Math.floor(t * 0.8) % edges.length;
  const [ea, eb] = edges[edgeIdx];
  const progress = (t * 0.8) % 1;
  const px = nodes[ea].x + (nodes[eb].x - nodes[ea].x) * progress;
  const py = nodes[ea].y + (nodes[eb].y - nodes[ea].y) * progress;
  ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#00c2ff"; ctx.shadowBlur = 10; ctx.shadowColor = "#00c2ff"; ctx.fill(); ctx.shadowBlur = 0;

  nodes.forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,149,255,0.18)"; ctx.strokeStyle = "rgba(140,186,255,0.65)";
    ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#9ec5ff"; ctx.fill();
  });
}

// ─── TOOLS — interactive frequency spectrum ───────────────────────────────────
// Tool list rendered as labeled frequency bands
const TOOL_BANDS = [
  { label: "Python",  color: [79, 149, 255] },
  { label: "MATLAB",  color: [0,  194, 255] },
  { label: "C/C++",   color: [100,220, 200] },
  { label: "Java",    color: [79, 149, 255] },
  { label: "React",   color: [97, 218, 251] },
  { label: "JS",      color: [240,210,  60] },
  { label: "HTML",    color: [230,100,  60] },
  { label: "CSS",     color: [100,160, 255] },
  { label: "Git",     color: [240,100,  80] },
  { label: "TCP/IP",  color: [79, 149, 255] },
  { label: "DNS",     color: [0,  194, 255] },
  { label: "Linux",   color: [200,200, 200] },
  { label: "VPN",     color: [120,220, 140] },
  { label: "5G NR",   color: [79, 149, 255] },
];

const toolDrawState = { mouse: null };

function drawTools(ctx, w, h, t, mouse) {
  ctx.clearRect(0, 0, w, h);

  const count  = TOOL_BANDS.length;
  const totalW = w * 0.86;
  const startX = w * 0.07;
  const barW   = totalW / count;
  const baseY  = h * 0.80;

  // baseline
  ctx.beginPath();
  ctx.moveTo(startX - 4, baseY); ctx.lineTo(startX + totalW + 4, baseY);
  ctx.strokeStyle = "rgba(100,160,255,0.25)"; ctx.lineWidth = 1; ctx.stroke();

  TOOL_BANDS.forEach((band, i) => {
    const bx     = startX + i * barW;
    const bCenter = bx + barW * 0.5;
    const freq   = i / count;
    const base   = Math.sin(freq * Math.PI * 3) * 0.38
      + Math.sin(freq * Math.PI * 7.3 + 1.2) * 0.24
      + Math.sin(freq * Math.PI * 13  + t * 1.1) * 0.14
      + Math.sin(t * 0.8 + i * 0.6) * 0.08;
    const barH   = Math.max(6, (0.45 + base * 0.55) * h * 0.58);

    // Hover detection
    const hovered = mouse && Math.abs(mouse.x - bCenter) < barW * 0.7;
    const [r, g, b] = band.color;
    const alpha = hovered ? 0.95 : 0.38 + base * 0.42;

    if (hovered) {
      ctx.shadowBlur = 22; ctx.shadowColor = `rgba(${r},${g},${b},0.7)`;
    }
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.fillRect(bx + barW * 0.08, baseY - barH, barW * 0.76, barH);
    ctx.shadowBlur = 0;

    // Tool label below baseline
    ctx.save();
    ctx.translate(bCenter, baseY + 8);
    ctx.rotate(Math.PI / 3.5);
    ctx.fillStyle = hovered ? `rgba(${r},${g},${b},1)` : "rgba(140,186,255,0.45)";
    ctx.font = `${hovered ? "bold " : ""}${Math.max(9, Math.floor(barW * 0.46))}px monospace`;
    ctx.fillText(band.label, 0, 0);
    ctx.restore();
  });

  // Scan cursor
  const scanX = startX + ((t * 0.4 * barW * count) % (barW * count));
  ctx.beginPath();
  ctx.moveTo(scanX, h * 0.08); ctx.lineTo(scanX, baseY + 2);
  ctx.strokeStyle = "rgba(0,194,255,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
}

// ─── SKILLS — modulation layers ───────────────────────────────────────────────
function drawSkills(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  const layers = [
    { freq: 2,  amp: 0.18, color: "rgba(79,149,255,0.52)",  lw: 2.5, off: 0   },
    { freq: 5,  amp: 0.10, color: "rgba(0,194,255,0.38)",   lw: 1.8, off: 0.3 },
    { freq: 9,  amp: 0.05, color: "rgba(140,186,255,0.28)", lw: 1.2, off: 0.7 },
  ];
  layers.forEach(({ freq, amp, color, lw, off }) => {
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = lw;
    for (let x = 0; x <= w; x += 2) {
      const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * freq + t * 0.7 + off) * (h * amp);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  // envelope
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = "rgba(255,255,255,0.055)"; ctx.lineWidth = 1;
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const sign = pass === 0 ? -1 : 1;
      const y = h / 2 + sign * Math.abs(Math.sin((x / w) * Math.PI * 2 + t * 0.25)) * h * 0.32;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

// ─── PROJECTS — thesis: beamforming RF arcs ───────────────────────────────────
function drawProjectsThesis(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  const tx = w * 0.18, ty = h * 0.5;
  for (let i = 1; i <= 6; i++) {
    const r = i * (w * 0.12) + ((t * 30) % (w * 0.12));
    const alpha = Math.max(0, 0.48 - (r / (w * 0.9)) * 0.48);
    ctx.beginPath(); ctx.arc(tx, ty, r, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.strokeStyle = `rgba(79,149,255,${alpha})`; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(tx, ty);
  ctx.lineTo(tx + w * 0.75, ty - h * 0.15); ctx.lineTo(tx + w * 0.75, ty + h * 0.15); ctx.closePath();
  ctx.fillStyle = "rgba(79,149,255,0.06)";
  ctx.strokeStyle = "rgba(140,186,255,0.28)"; ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#4f95ff"; ctx.shadowBlur = 14; ctx.shadowColor = "#4f95ff"; ctx.fill(); ctx.shadowBlur = 0;
}

// ─── PROJECTS — networking: packet route ─────────────────────────────────────
function drawProjectsNetworking(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  const path = [
    { x: w * 0.08, y: h * 0.5  }, { x: w * 0.28, y: h * 0.25 },
    { x: w * 0.50, y: h * 0.60 }, { x: w * 0.72, y: h * 0.30 },
    { x: w * 0.92, y: h * 0.5  },
  ];
  for (let i = 0; i < path.length - 1; i++) {
    ctx.beginPath(); ctx.moveTo(path[i].x, path[i].y); ctx.lineTo(path[i+1].x, path[i+1].y);
    ctx.strokeStyle = "rgba(79,149,255,0.28)"; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);
  }
  const totalSteps = path.length - 1;
  const progress = (t * 0.5) % totalSteps;
  const seg = Math.min(Math.floor(progress), path.length - 2);
  const frac = progress - Math.floor(progress);
  const px = path[seg].x + (path[seg+1].x - path[seg].x) * frac;
  const py = path[seg].y + (path[seg+1].y - path[seg].y) * frac;
  ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#00c2ff"; ctx.shadowBlur = 12; ctx.shadowColor = "#00c2ff"; ctx.fill(); ctx.shadowBlur = 0;
  path.forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100,160,255,0.22)"; ctx.strokeStyle = "rgba(140,186,255,0.65)";
    ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
  });
}

// ─── PROJECTS — IoT: hub-and-spoke topology ──────────────────────────────────
function drawProjectsIoT(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  const hub = { x: w / 2, y: h / 2 };
  const sensorNodes = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + t * 0.15;
    return { x: hub.x + Math.cos(angle) * w * 0.30, y: hub.y + Math.sin(angle) * h * 0.35 };
  });
  sensorNodes.forEach(n => {
    ctx.beginPath(); ctx.moveTo(hub.x, hub.y); ctx.lineTo(n.x, n.y);
    ctx.strokeStyle = "rgba(79,149,255,0.20)"; ctx.lineWidth = 1; ctx.stroke();
  });
  const pingR = (t * 60) % 90;
  ctx.beginPath(); ctx.arc(hub.x, hub.y, pingR, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0,194,255,${0.38 * (1 - pingR / 90)})`; ctx.lineWidth = 1.5; ctx.stroke();
  sensorNodes.forEach(n => {
    ctx.beginPath(); ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,149,255,0.28)"; ctx.strokeStyle = "rgba(140,186,255,0.75)";
    ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
  });
  ctx.beginPath(); ctx.arc(hub.x, hub.y, 9, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(79,149,255,0.18)"; ctx.strokeStyle = "#9ec5ff"; ctx.lineWidth = 2; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(hub.x, hub.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#4f95ff"; ctx.shadowBlur = 12; ctx.shadowColor = "#4f95ff"; ctx.fill(); ctx.shadowBlur = 0;
}

// ─── PROJECTS — software: sliding protocol bars ───────────────────────────────
function drawProjectsSoftware(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  const rows = 5;
  const rowH = h / (rows + 2);
  for (let r = 0; r < rows; r++) {
    const y = rowH * (r + 1.2);
    const offset = (t * 0.3 * (r % 2 === 0 ? 1 : -1) * 60) % w;
    const segments = 4 + r;
    const segW = w / segments;
    for (let s = 0; s < segments + 1; s++) {
      const sx = ((s * segW + offset) % (w + segW)) - segW * 0.1;
      const alpha = 0.07 + (r / rows) * 0.16;
      const active = Math.floor((t * 2 + r) % segments) === s % segments;
      ctx.fillStyle = active ? `rgba(79,149,255,${alpha + 0.24})` : `rgba(79,149,255,${alpha})`;
      if (active) { ctx.shadowBlur = 8; ctx.shadowColor = "rgba(79,149,255,0.4)"; }
      ctx.fillRect(sx, y, segW * 0.78, rowH * 0.55);
      ctx.shadowBlur = 0;
    }
  }
}

// ─── HIRE ME — broadcast tower: antenna + radiating carrier waves ─────────────
function drawHireMe(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);

  const ax = w * 0.5, ay = h * 0.18;

  // 3 carrier waves radiating outward from tower
  [0, 1, 2].forEach(layer => {
    const phaseOffset = layer * (Math.PI * 2 / 3);
    const timePhase   = (t * 0.55 + phaseOffset) % (Math.PI * 2);
    const spread      = 0.35 + layer * 0.22;
    const amp         = h * (0.10 + layer * 0.08);
    const centerY     = h * (0.52 + layer * 0.14);
    const alpha       = 0.50 - layer * 0.12;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(79,149,255,${alpha})`;
    ctx.lineWidth = 2.5 - layer * 0.6;
    for (let x = 0; x <= w; x += 2) {
      const phase = (x / w) * Math.PI * 2 * (2 + layer) + timePhase;
      const env   = Math.sin((x / w) * Math.PI);  // fade at edges
      const y     = centerY + Math.sin(phase) * amp * env;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Antenna tower
  ctx.beginPath(); ctx.moveTo(ax, ay + 6); ctx.lineTo(ax, ay + h * 0.30);
  ctx.strokeStyle = "rgba(140,186,255,0.55)"; ctx.lineWidth = 2.5; ctx.stroke();
  // Cross bars
  [[0.08, 22], [0.16, 16], [0.24, 10]].forEach(([yFrac, halfW]) => {
    const barY = ay + h * yFrac;
    ctx.beginPath(); ctx.moveTo(ax - halfW, barY); ctx.lineTo(ax + halfW, barY);
    ctx.strokeStyle = "rgba(140,186,255,0.40)"; ctx.lineWidth = 1.5; ctx.stroke();
  });
  // Pulsing rings from tip
  [0.55, 0.30, 0.12].forEach((alpha, i) => {
    const r    = 14 + i * 16 + ((t * 38) % 32);
    const fade = 1 - ((t * 38) % 32) / 32;
    ctx.beginPath(); ctx.arc(ax, ay, r, -Math.PI * 0.55, Math.PI * 0.55 - Math.PI);
    ctx.strokeStyle = `rgba(79,149,255,${alpha * fade})`;
    ctx.lineWidth = 1.5 - i * 0.35; ctx.stroke();
  });
  // Tip dot
  ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#00c2ff"; ctx.shadowBlur = 14; ctx.shadowColor = "#00c2ff"; ctx.fill(); ctx.shadowBlur = 0;
}

// ─── CONTACT — endpoint handshake ────────────────────────────────────────────
function drawContact(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  const ly = h * 0.42, ry = h * 0.58;
  const lx = w * 0.12, rx = w * 0.88;
  const midX = w / 2, midY = (ly + ry) / 2;
  const linkT = (Math.sin(t * 0.5) + 1) / 2;

  const lEndX = lx + (midX - lx) * linkT, lEndY = ly + (midY - ly) * linkT;
  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lEndX, lEndY);
  ctx.strokeStyle = "rgba(79,149,255,0.68)"; ctx.lineWidth = 2.5;
  ctx.shadowBlur = 10; ctx.shadowColor = "rgba(79,149,255,0.4)"; ctx.stroke(); ctx.shadowBlur = 0;

  const rEndX = rx + (midX - rx) * linkT, rEndY = ry + (midY - ry) * linkT;
  ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rEndX, rEndY);
  ctx.strokeStyle = "rgba(0,194,255,0.68)"; ctx.lineWidth = 2.5;
  ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,194,255,0.4)"; ctx.stroke(); ctx.shadowBlur = 0;

  if (linkT > 0.95) {
    ctx.beginPath(); ctx.arc(midX, midY, 14 * linkT, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,194,255,${(linkT - 0.95) * 20 * 0.5})`;
    ctx.lineWidth = 2; ctx.stroke();
  }

  [[lx, ly, "#4f95ff"], [rx, ry, "#00c2ff"]].forEach(([nx, ny, color]) => {
    ctx.beginPath(); ctx.arc(nx, ny, 9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,149,255,0.14)"; ctx.strokeStyle = "rgba(140,186,255,0.75)";
    ctx.lineWidth = 2; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(nx, ny, 5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.fill(); ctx.shadowBlur = 0;
  });
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────
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
  const mouseRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    const drawFn = getDrawFn(variant, projectType);

    // Track mouse for tools hover effect
    const isTools = variant === "tools";
    const handleMouse = isTools ? (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    } : null;
    const handleLeave = isTools ? () => { mouseRef.current = null; } : null;
    if (handleMouse) {
      canvas.parentElement.addEventListener("mousemove", handleMouse);
      canvas.parentElement.addEventListener("mouseleave", handleLeave);
    }

    function loop(ts) {
      if (lastRef.current !== null) timeRef.current += (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      const p = canvas.parentElement;
      canvas.width  = p.offsetWidth;
      canvas.height = p.offsetHeight;
      drawFn(ctx, canvas.width, canvas.height, timeRef.current, mouseRef.current);
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);

    const handleResize = () => {
      const p = canvas.parentElement;
      canvas.width  = p.offsetWidth;
      canvas.height = p.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      if (handleMouse) {
        canvas.parentElement?.removeEventListener("mousemove", handleMouse);
        canvas.parentElement?.removeEventListener("mouseleave", handleLeave);
      }
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
