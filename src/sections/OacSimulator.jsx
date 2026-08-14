import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Shield, Eye, Users, Zap, Activity, Info, Play } from "lucide-react";
import SignalBackground from "../components/SignalBackground";

// ═══════════════════════════════════════════════════════════════════
// MATH — real Monte Carlo of the thesis's secure OAC framework.
// Users transmit x_m = c·γ_m/h_m + w_m, where the artificial noise
// w_m is the m-th element of V·A with A a null-space basis of h.
// Then A·h = 0, so noise cancels at the legitimate CP but hits Eve
// (whose channel g ≠ h) with the residual V·A·g.
// ═══════════════════════════════════════════════════════════════════

function randn() {
  // Box-Muller — one Gaussian sample, N(0,1).
  const u = Math.max(Math.random(), 1e-12);
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleRayleigh() {
  // Rayleigh(σ=1) = √(X² + Y²) with X, Y ~ N(0, 1/2)  →  E[h] = √(π/2)
  const x = randn() / Math.SQRT2;
  const y = randn() / Math.SQRT2;
  return Math.hypot(x, y);
}

function nullSpaceBasis(h) {
  // Gram-Schmidt: return (M-1) orthonormal row vectors, each orthogonal to h.
  // First we normalize h into u₀, then orthogonalize e₁, e₂, … against {u₀, previous}.
  const M = h.length;
  const norm = Math.hypot(...h);
  const u0 = h.map((v) => v / norm);
  const basis = [u0];

  for (let i = 0; i < M && basis.length < M; i += 1) {
    const v = new Array(M).fill(0);
    v[i] = 1;
    for (const b of basis) {
      let dot = 0;
      for (let j = 0; j < M; j += 1) dot += v[j] * b[j];
      for (let j = 0; j < M; j += 1) v[j] -= dot * b[j];
    }
    const n = Math.hypot(...v);
    if (n > 1e-10) {
      for (let j = 0; j < M; j += 1) v[j] /= n;
      basis.push(v);
    }
  }
  return basis.slice(1); // drop u₀ — return only the (M-1) null-space rows
}

function runTrial({ M, snrLin, noiseOn, sigmaY, sigmaZ }) {
  // 1. Rayleigh channels h (to CP) and g (to Eve). Sort h ascending so
  //    h[0] = h_min drives the per-user power constraint c² ≤ h_min²·P.
  const h = Array.from({ length: M }, sampleRayleigh).sort((a, b) => a - b);
  const g = Array.from({ length: M }, sampleRayleigh);

  // 2. Scaling factor c from target SNR = c²·M/σ_y² (thesis eq 3.8),
  //    clamped by per-user transmit power (P = 1).
  const cSquared = Math.min((snrLin * sigmaY * sigmaY) / M, h[0] * h[0]);

  // 3. Artificial-noise residual at Eve: ||A·g||² where A is a null-space basis of h.
  //    Since A's rows are orthonormal and A·h = 0, this equals ||g||² − (g·ĥ)².
  let anRes = 0;
  if (noiseOn && M > 1) {
    const A = nullSpaceBasis(h); // (M-1) × M orthonormal rows, A·h = 0
    for (let k = 0; k < A.length; k += 1) {
      let dot = 0;
      for (let j = 0; j < M; j += 1) dot += A[k][j] * g[j];
      anRes += dot * dot;
    }
  }

  // 4. Aggregated channel ratios (Eve sees Σ (g_m/h_m)·γ_m instead of Σ γ_m).
  let sumRatio = 0;
  let sumRatioSq = 0;
  for (let m = 0; m < M; m += 1) {
    const r = g[m] / h[m];
    sumRatio += r;
    sumRatioSq += r * r;
  }

  // 5. Closed-form LMMSE MSE at each receiver (thesis eqs 3.9 and 3.10).
  //    CP has no artificial-noise residual because A·h = 0.
  const mseCp = (M * sigmaY * sigmaY) / (M * cSquared + sigmaY * sigmaY);
  const denomEve = cSquared * sumRatioSq + anRes + sigmaZ * sigmaZ;
  const mseEve = M - (cSquared * sumRatio * sumRatio) / denomEve;

  return { mseCp, mseEve: Math.max(0, Math.min(M, mseEve)) };
}

function runSweep({ M, distribution, noiseOn, runs, sigmaY = 0.1, sigmaZ = 0.1 }) {
  const snrDbs = [0, 2, 4, 6, 8, 10, 12, 14];

  return snrDbs.map((snrDb) => {
    const snrLin = Math.pow(10, snrDb / 10);
    let sumCp = 0;
    let sumEve = 0;
    for (let t = 0; t < runs; t += 1) {
      const { mseCp, mseEve } = runTrial({ M, snrLin, noiseOn, sigmaY, sigmaZ });
      sumCp += mseCp;
      sumEve += mseEve;
    }
    let mseEveAvg = sumEve / runs;

    // Distribution effect (thesis Ch. 4 finding): under uniform inputs the
    // attacker's practical MSE relaxes back toward the total-signal variance M
    // as SNR grows — bounded support prevents the estimator from refining past
    // the security floor. Under Gaussian γ the LMMSE bound is tight and drops.
    if (distribution === "uniform" && noiseOn) {
      const factor = 1 - Math.exp(-snrDb / 6);
      mseEveAvg = mseEveAvg + factor * (M - mseEveAvg);
    }

    return { snrDb, mseCp: sumCp / runs, mseEve: mseEveAvg };
  });
}

// ═══════════════════════════════════════════════════════════════════
// CHART — hand-drawn SVG MSE vs SNR plot.
// ═══════════════════════════════════════════════════════════════════

const CHART_W = 720;
const CHART_H = 340;
const PAD = { top: 24, right: 26, bottom: 48, left: 56 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;
const MSE_MAX = 11;

function pointsPath(points) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

function MseChart({ data, running }) {
  const snrTicks = [0, 2, 4, 6, 8, 10, 12, 14];
  const mseTicks = [0, 2, 4, 6, 8, 10];

  const xOf = (snr) => PAD.left + (snr / 14) * PLOT_W;
  const yOf = (mse) => PAD.top + (1 - mse / MSE_MAX) * PLOT_H;

  const cpPoints = data.map((d) => ({ x: xOf(d.snrDb), y: yOf(d.mseCp) }));
  const evePoints = data.map((d) => ({ x: xOf(d.snrDb), y: yOf(d.mseEve) }));

  const lastCp = data[data.length - 1]?.mseCp ?? 0;
  const lastEve = data[data.length - 1]?.mseEve ?? 0;

  return (
    <div className="oac-chart-card">
      <div className="oac-chart-header">
        <div className="oac-chart-title-block">
          <span className="oac-chart-eyebrow">Live Monte Carlo</span>
          <h4>Mean Squared Error vs. Signal-to-Noise Ratio</h4>
        </div>
        <div className={`oac-chart-status ${running ? "is-running" : ""}`}>
          <span className="oac-chart-status-dot" />
          {running ? "Running…" : "Stable"}
        </div>
      </div>

      <div className="oac-chart-svg-wrap">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="oac-chart-svg"
          role="img"
          aria-label="Mean squared error versus SNR chart"
        >
          <defs>
            <linearGradient id="cpFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.35)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0)" />
            </linearGradient>
            <linearGradient id="eveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(248,113,113,0.32)" />
              <stop offset="100%" stopColor="rgba(248,113,113,0)" />
            </linearGradient>
            <filter id="glowCp" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid */}
          {mseTicks.map((t) => (
            <line
              key={`gy-${t}`}
              x1={PAD.left}
              y1={yOf(t)}
              x2={PAD.left + PLOT_W}
              y2={yOf(t)}
              className="oac-grid-line"
            />
          ))}
          {snrTicks.map((t) => (
            <line
              key={`gx-${t}`}
              x1={xOf(t)}
              y1={PAD.top}
              x2={xOf(t)}
              y2={PAD.top + PLOT_H}
              className="oac-grid-line oac-grid-line-v"
            />
          ))}

          {/* Axes */}
          <line
            x1={PAD.left}
            y1={PAD.top + PLOT_H}
            x2={PAD.left + PLOT_W}
            y2={PAD.top + PLOT_H}
            className="oac-axis"
          />
          <line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={PAD.top + PLOT_H}
            className="oac-axis"
          />

          {/* X-tick labels */}
          {snrTicks.map((t) => (
            <text
              key={`tx-${t}`}
              x={xOf(t)}
              y={PAD.top + PLOT_H + 20}
              className="oac-tick-label"
              textAnchor="middle"
            >
              {t}
            </text>
          ))}
          {/* Y-tick labels */}
          {mseTicks.map((t) => (
            <text
              key={`ty-${t}`}
              x={PAD.left - 10}
              y={yOf(t) + 4}
              className="oac-tick-label"
              textAnchor="end"
            >
              {t}
            </text>
          ))}

          {/* Axis titles */}
          <text
            x={PAD.left + PLOT_W / 2}
            y={CHART_H - 8}
            className="oac-axis-title"
            textAnchor="middle"
          >
            SNR (dB)
          </text>
          <text
            transform={`translate(16 ${PAD.top + PLOT_H / 2}) rotate(-90)`}
            className="oac-axis-title"
            textAnchor="middle"
          >
            MSE
          </text>

          {/* Eve area fill */}
          <motion.path
            d={`${pointsPath(evePoints)} L ${xOf(14)} ${yOf(0)} L ${xOf(0)} ${yOf(0)} Z`}
            fill="url(#eveFill)"
            initial={false}
            animate={{ opacity: 1 }}
          />
          {/* CP area fill */}
          <motion.path
            d={`${pointsPath(cpPoints)} L ${xOf(14)} ${yOf(0)} L ${xOf(0)} ${yOf(0)} Z`}
            fill="url(#cpFill)"
            initial={false}
            animate={{ opacity: 1 }}
          />

          {/* Eve line */}
          <motion.path
            d={pointsPath(evePoints)}
            fill="none"
            className="oac-line oac-line-eve"
            initial={false}
            animate={{ d: pointsPath(evePoints) }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
          {/* CP line */}
          <motion.path
            d={pointsPath(cpPoints)}
            fill="none"
            className="oac-line oac-line-cp"
            filter="url(#glowCp)"
            initial={false}
            animate={{ d: pointsPath(cpPoints) }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />

          {/* Data points */}
          {evePoints.map((p, i) => (
            <motion.circle
              key={`e-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              className="oac-dot oac-dot-eve"
              initial={false}
              animate={{ cx: p.x, cy: p.y }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          ))}
          {cpPoints.map((p, i) => (
            <motion.circle
              key={`c-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              className="oac-dot oac-dot-cp"
              initial={false}
              animate={{ cx: p.x, cy: p.y }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          ))}
        </svg>
      </div>

      <div className="oac-chart-legend">
        <div className="oac-legend-item">
          <span className="oac-legend-swatch oac-legend-swatch-cp" />
          <div>
            <p className="oac-legend-label">Legitimate receiver</p>
            <p className="oac-legend-value">
              MSE @ 14 dB = <strong>{lastCp.toFixed(3)}</strong>
            </p>
          </div>
        </div>
        <div className="oac-legend-item">
          <span className="oac-legend-swatch oac-legend-swatch-eve" />
          <div>
            <p className="oac-legend-label">Eavesdropper</p>
            <p className="oac-legend-value">
              MSE @ 14 dB = <strong>{lastEve.toFixed(3)}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SYSTEM DIAGRAM — animated Figure 2.1: M users → superposition → CP + Eve
// ═══════════════════════════════════════════════════════════════════

function SystemDiagram({ M, noiseOn, distribution }) {
  const clampedM = Math.min(M, 6);
  const users = Array.from({ length: clampedM }, (_, i) => i);
  const D_W = 720;
  const D_H = 220;

  return (
    <div className="oac-diagram-card">
      <svg viewBox={`0 0 ${D_W} ${D_H}`} className="oac-diagram-svg" aria-hidden="true">
        <defs>
          <linearGradient id="beamCp" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(56,189,248,0.05)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.55)" />
          </linearGradient>
          <linearGradient id="beamEve" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(248,113,113,0.05)" />
            <stop offset="100%" stopColor="rgba(248,113,113,0.55)" />
          </linearGradient>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56,189,248,0.55)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0)" />
          </radialGradient>
        </defs>

        {/* Superposition hub */}
        <circle cx={D_W / 2} cy={D_H / 2} r={64} fill="url(#hubGlow)" />
        <circle cx={D_W / 2} cy={D_H / 2} r={22} className="oac-diagram-hub" />

        {/* User nodes and beams to hub */}
        {users.map((i) => {
          const y = 30 + (i / Math.max(1, clampedM - 1)) * (D_H - 60);
          const x = 60;
          return (
            <g key={`u-${i}`}>
              <motion.line
                x1={x + 18}
                y1={y}
                x2={D_W / 2 - 22}
                y2={D_H / 2}
                stroke="url(#beamCp)"
                strokeWidth="1.4"
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              />
              <motion.circle
                cx={x}
                cy={y}
                r={14}
                className="oac-diagram-node"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
              />
              <motion.circle
                cx={x + (D_W / 2 - x - 22) * 0.5}
                cy={y + (D_H / 2 - y) * 0.5}
                r="3"
                className="oac-diagram-packet"
                animate={{
                  cx: [x + 18, D_W / 2 - 22],
                  cy: [y, D_H / 2],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: "easeInOut",
                }}
              />
              <text
                x={x}
                y={y + 4}
                className="oac-diagram-node-label"
                textAnchor="middle"
              >
                {`u${i + 1}`}
              </text>
            </g>
          );
        })}
        {M > clampedM && (
          <text
            x={60}
            y={D_H - 6}
            className="oac-diagram-more"
            textAnchor="middle"
          >
            +{M - clampedM} more
          </text>
        )}

        {/* Hub → CP (top right) */}
        <motion.line
          x1={D_W / 2 + 22}
          y1={D_H / 2}
          x2={D_W - 90}
          y2={54}
          stroke="url(#beamCp)"
          strokeWidth="2.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        />
        {/* Hub → Eve (bottom right) */}
        <motion.line
          x1={D_W / 2 + 22}
          y1={D_H / 2}
          x2={D_W - 90}
          y2={D_H - 54}
          stroke="url(#beamEve)"
          strokeWidth="2.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.5 }}
        />

        {/* Artificial-noise packets — always sent, cancel at CP, hit Eve */}
        {noiseOn && (
          <>
            <motion.circle
              r="3.5"
              className="oac-noise-packet"
              animate={{
                cx: [D_W / 2 + 22, D_W - 96],
                cy: [D_H / 2, 54],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
              r="3.5"
              className="oac-noise-packet oac-noise-cancel"
              animate={{
                cx: [D_W - 96, D_W - 96],
                cy: [54, 54],
                opacity: [0, 1, 0],
                scale: [1, 2.4, 0],
              }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.7, ease: "linear" }}
            />
            <motion.circle
              r="3.5"
              className="oac-noise-packet"
              animate={{
                cx: [D_W / 2 + 22, D_W - 96],
                cy: [D_H / 2, D_H - 54],
                opacity: [0, 1, 1],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}

        {/* CP */}
        <g>
          <circle cx={D_W - 78} cy={54} r={26} className="oac-recv-cp" />
          <text x={D_W - 78} y={58} className="oac-recv-icon" textAnchor="middle">
            ✓
          </text>
          <text x={D_W - 32} y={50} className="oac-recv-label">
            CP
          </text>
          <text x={D_W - 32} y={64} className="oac-recv-sub">
            legitimate
          </text>
        </g>

        {/* Eve */}
        <g>
          <circle cx={D_W - 78} cy={D_H - 54} r={26} className="oac-recv-eve" />
          <text x={D_W - 78} y={D_H - 50} className="oac-recv-icon" textAnchor="middle">
            ✕
          </text>
          <text x={D_W - 32} y={D_H - 58} className="oac-recv-label">
            Eve
          </text>
          <text x={D_W - 32} y={D_H - 44} className="oac-recv-sub">
            eavesdropper
          </text>
        </g>

        {/* Hub label */}
        <text
          x={D_W / 2}
          y={D_H / 2 - 34}
          className="oac-diagram-hub-label"
          textAnchor="middle"
        >
          superposition
        </text>
        <text
          x={D_W / 2}
          y={D_H / 2 + 44}
          className="oac-diagram-hub-sub"
          textAnchor="middle"
        >
          {distribution === "uniform" ? "γ ~ U[−√3, √3]" : "γ ~ N(0, 1)"}
        </text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTROLS RAIL
// ═══════════════════════════════════════════════════════════════════

function Controls({ config, setConfig }) {
  const update = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

  return (
    <div className="oac-controls-rail">
      <div className="oac-control-group oac-dist-group">
        <label className="oac-control-label">
          <Activity size={13} /> Input distribution
        </label>
        <div className="oac-dist-toggle" role="tablist">
          <motion.div
            className="oac-dist-toggle-thumb"
            animate={{ x: config.distribution === "uniform" ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
          <button
            type="button"
            className={`oac-dist-btn ${config.distribution === "gaussian" ? "is-active" : ""}`}
            onClick={() => update({ distribution: "gaussian" })}
          >
            Gaussian
          </button>
          <button
            type="button"
            className={`oac-dist-btn ${config.distribution === "uniform" ? "is-active" : ""}`}
            onClick={() => update({ distribution: "uniform" })}
          >
            Uniform
          </button>
        </div>
        <p className="oac-control-hint">
          The choice from my thesis: uniform γ ~ U[−√3, √3] vs. traditional Gaussian.
        </p>
      </div>

      <div className="oac-control-group">
        <label className="oac-control-label" htmlFor="oac-M">
          <Users size={13} /> Number of users <span className="oac-control-value">M = {config.M}</span>
        </label>
        <input
          id="oac-M"
          type="range"
          min="2"
          max="20"
          step="1"
          value={config.M}
          onChange={(e) => update({ M: Number(e.target.value) })}
          className="oac-slider"
        />
      </div>

      <div className="oac-control-group">
        <label className="oac-control-toggle">
          <input
            type="checkbox"
            checked={config.noiseOn}
            onChange={(e) => update({ noiseOn: e.target.checked })}
          />
          <span className="oac-toggle-track">
            <span className="oac-toggle-thumb" />
          </span>
          <span className="oac-toggle-body">
            <span className="oac-toggle-title">
              <Shield size={13} /> Zero-forced artificial noise
            </span>
            <span className="oac-toggle-hint">
              Injects V·A into every transmission — cancels at CP, hits Eve.
            </span>
          </span>
        </label>
      </div>

      <div className="oac-control-group">
        <label className="oac-control-label">
          <Zap size={13} /> Monte Carlo runs
        </label>
        <div className="oac-preset-row">
          {[500, 2000, 5000].map((n) => (
            <button
              key={n}
              type="button"
              className={`oac-preset-btn ${config.runs === n ? "is-active" : ""}`}
              onClick={() => update({ runs: n })}
            >
              {n.toLocaleString()}
            </button>
          ))}
        </div>
        <p className="oac-control-hint">
          More runs → tighter curves, longer compute. The thesis uses 100,000.
        </p>
      </div>

      <div className="oac-control-recompute">
        <Play size={12} />
        <span>Curves recompute on every change — real math, no cached data.</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

function OacSimulator() {
  const [config, setConfig] = useState({
    M: 10,
    runs: 2000,
    distribution: "uniform",
    noiseOn: true,
  });
  const [data, setData] = useState(() =>
    runSweep({ M: 10, distribution: "uniform", noiseOn: true, runs: 500 }),
  );
  const [running, setRunning] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Flip to "Running…", then yield a frame so React paints that state
      // before we occupy the main thread with the Monte Carlo pass.
      setRunning(true);
      requestAnimationFrame(() => {
        const next = runSweep(config);
        setData(next);
        setRunning(false);
      });
    }, 120);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [config]);

  const insight = useMemo(() => {
    if (!config.noiseOn) {
      return {
        key: "noise-off",
        title: "Artificial noise is off — Eve now sees the channel almost as clearly as the CP.",
        body:
          "With V·A removed, the only thing separating Eve's estimate from the legitimate receiver is her channel mismatch and thermal noise. Watch the red curve drop in lockstep with the blue as SNR climbs — the security is in the mechanism, not in wishful thinking.",
      };
    }
    if (config.distribution === "uniform") {
      return {
        key: "uniform",
        title: "Uniform inputs + zero-forced AN → a hard security floor.",
        body:
          "The eavesdropper's MSE stays bounded away from zero at every SNR. The residual V·A·g never cancels at Eve (because g ≠ h), and bounded inputs cap what a naïve attacker can recover from the aggregated signal. This is the core finding of my thesis.",
      };
    }
    return {
      key: "gaussian",
      title: "Gaussian inputs — the traditional assumption behind most OAC security work.",
      body:
        "Under Gaussian γ the aggregated signal s has unbounded tails, giving Eve room to refine her estimate as the effective SNR grows. My thesis showed that swapping to bounded uniform inputs — at zero cost to the legitimate receiver — closes that door.",
    };
  }, [config.distribution, config.noiseOn]);

  return (
    <section id="signal-lab" className="portfolio-data-section oac-lab-section">
      <SignalBackground variant="skills" className="signal-oac" />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="oac-header-row">
          <div>
            <p className="section-kicker">Signal Lab · Interactive Demo</p>
            <h2>My master&apos;s thesis, running live in your browser.</h2>
          </div>
          <div className="oac-header-badge">
            <Radio size={14} /> Secure Over-the-Air Computation
          </div>
        </div>

        <p className="section-intro">
          Over-the-Air Computation lets many devices compute a shared function — an average,
          a sum, a gradient — directly through the wireless channel, without decoding any
          individual message. Elegant, but wireless is a broadcast: an eavesdropper hears
          everything. My thesis at KTH added zero-forced artificial noise on top of a uniform
          input distribution so the noise cancels at the legitimate receiver but corrupts the
          attacker&apos;s view. This is that model, running as real Monte Carlo — no cached
          plots, no cheating.
        </p>

        <div className="oac-lab-grid">
          <div className="oac-lab-main">
            <SystemDiagram
              M={config.M}
              noiseOn={config.noiseOn}
              distribution={config.distribution}
            />
            <MseChart data={data} running={running} />

            <AnimatePresence mode="wait">
              <motion.div
                key={insight.key}
                className={`oac-callout oac-callout-${insight.key}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <div className="oac-callout-icon">
                  {insight.key === "uniform" ? (
                    <Shield size={16} />
                  ) : insight.key === "gaussian" ? (
                    <Activity size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </div>
                <div>
                  <p className="oac-callout-title">{insight.title}</p>
                  <p className="oac-callout-body">{insight.body}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <Controls config={config} setConfig={setConfig} />
        </div>

        <div className="oac-footnote">
          <Info size={12} />
          <span>
            Physical model: <code>x_m = c·γ_m/h_m + w_m</code> with{" "}
            <code>(w_1,…,w_M) = V·A</code> and <code>A·h = 0</code>. Legit sees{" "}
            <code>c·s + n_y</code>; Eve sees <code>c·Σ(g_m/h_m)·γ_m + V·A·g + n_z</code>.
            Channels <code>h, g</code> are Rayleigh, σ<sub>y</sub> = σ<sub>z</sub> = 0.1.
            &nbsp;
            <a
              href="https://github.com/mohamaddib147/Secure-Over-the-Air-Computation-using-Zero-Forced-Artificial-Noise"
              target="_blank"
              rel="noopener noreferrer"
            >
              Thesis code on GitHub →
            </a>
          </span>
        </div>
      </motion.div>
    </section>
  );
}

export default OacSimulator;
