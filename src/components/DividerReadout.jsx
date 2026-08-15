import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { Lock, Unlock, Minus, Plus } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// MATH — real formulas, not decoration. Each cursor-driven metric is
// driven by a single normalized input t ∈ [0,1] (cursor position
// along the divider), mapped through the actual textbook equation.
// ═══════════════════════════════════════════════════════════════════

const METRICS = {
  rssi: {
    label: "RSSI",
    caption:
      "RSSI measures how strong a wireless signal is, in dBm. Closer to 0 is stronger — −50 dBm is excellent, −90 dBm is barely there.",
    idleRange: [0.3, 0.68],
    // Log-distance path loss model: RSSI = P0 − 10·n·log10(d/d0)
    compute(t) {
      const distance = 1 + t * 29; // 1m .. 30m
      const n = 2.7; // typical indoor path-loss exponent
      const rssi = Math.max(-95, Math.min(-30, -30 - 10 * n * Math.log10(distance)));
      return { display: `${Math.round(rssi)} dBm`, rssi, distance };
    },
  },
  snr: {
    label: "SNR",
    caption:
      "SNR compares signal power to background noise — the higher the ratio, the cleaner the transmission. This 'eye diagram' is how engineers visually judge signal quality.",
    idleRange: [0.28, 0.72],
    invert: true, // top of the divider = high SNR
    compute(t) {
      const snr = t * 30; // 0 .. 30 dB
      return { display: `${snr.toFixed(1)} dB`, snr };
    },
  },
  latency: {
    label: "LATENCY",
    caption:
      "Latency is the round-trip time for a signal to travel and return — critical for real-time systems like calls, gaming, or self-driving cars.",
    idleRange: [0.22, 0.58],
    compute(t) {
      const distance = t * 100; // simulated hops/km
      const latency = 5 + distance * 0.6; // 5 .. 65 ms
      return { display: `${Math.round(latency)} ms`, latency };
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// MINI VISUALS — one bespoke, purpose-built diagram per metric.
// ═══════════════════════════════════════════════════════════════════

function RssiVisual({ rssi }) {
  const bars = rssi >= -50 ? 5 : rssi >= -60 ? 4 : rssi >= -70 ? 3 : rssi >= -80 ? 2 : 1;
  return (
    <div className="rssi-bars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`rssi-bar ${i < bars ? "is-active" : ""}`} />
      ))}
    </div>
  );
}

const NOISE_DOTS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 37) % 100,
  y: 4 + ((i * 53) % 30),
}));

function SnrVisual({ t }) {
  const blur = (1 - t) * 2.4;
  const noiseOpacity = (1 - t) * 0.65;
  const traces = [-7, -3.5, 0, 3.5, 7];
  return (
    <svg viewBox="0 0 100 38" className="snr-eye" aria-hidden="true">
      <g style={{ filter: `blur(${blur}px)` }}>
        {traces.map((offset, i) => (
          <path
            key={i}
            d={`M0 19 L22 ${19 + offset * 0.45} L50 ${19 - offset} L78 ${19 + offset * 0.45} L100 19`}
            className="snr-eye-trace"
          />
        ))}
      </g>
      <g style={{ opacity: noiseOpacity }}>
        {NOISE_DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="0.9" className="snr-noise-dot" />
        ))}
      </g>
    </svg>
  );
}

function LatencyVisual({ latency }) {
  // Map 5..65ms onto a perceptible round-trip animation duration.
  const halfTrip = 0.4 + ((latency - 5) / 60) * 1.1;
  return (
    <svg viewBox="0 0 100 30" className="latency-track" aria-hidden="true">
      <line x1="6" y1="15" x2="94" y2="15" className="latency-line" />
      <circle cx="6" cy="15" r="3.4" className="latency-node" />
      <circle cx="94" cy="15" r="3.4" className="latency-node" />
      <motion.circle
        cy="15"
        r="2.6"
        className="latency-packet"
        animate={{ cx: [6, 94, 6] }}
        transition={{ duration: halfTrip * 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CURSOR-DRIVEN READOUT (RSSI / SNR / Latency) — shared machinery.
// Idle: gentle animation through the metric's natural range. Hover:
// cursor position takes over. Lock: freezes the current value so you
// can pin a number in place instead of it drifting or cursor-chasing.
// ═══════════════════════════════════════════════════════════════════

function CursorReadout({ metric }) {
  const config = useMemo(() => METRICS[metric], [metric]);
  const containerRef = useRef(null);
  const progress = useMotionValue((config.idleRange[0] + config.idleRange[1]) / 2);
  const springProgress = useSpring(progress, { stiffness: 90, damping: 20 });
  const idleControlsRef = useRef(null);
  const [t, setT] = useState(progress.get());
  const [locked, setLocked] = useState(false);
  const [lockedValue, setLockedValue] = useState(null);

  useEffect(() => {
    const unsub = springProgress.on("change", (v) => setT(Math.min(Math.max(v, 0), 1)));
    return unsub;
  }, [springProgress]);

  useEffect(() => {
    const [from, to] = config.idleRange;
    idleControlsRef.current = animate(progress, [from, to, from], {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return () => idleControlsRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMove = (e) => {
    if (locked) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const xNorm = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const yNorm = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    progress.set(config.invert ? 1 - yNorm : xNorm);
  };

  const handleEnter = () => {
    if (!locked) idleControlsRef.current?.stop();
  };

  const handleLeave = () => {
    if (locked) return;
    const [from, to] = config.idleRange;
    idleControlsRef.current = animate(progress, [progress.get(), from, to, from], {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    });
  };

  const toggleLock = () => {
    if (!locked) {
      idleControlsRef.current?.stop();
      setLockedValue(t);
      setLocked(true);
    } else {
      setLocked(false);
      const [from, to] = config.idleRange;
      idleControlsRef.current = animate(progress, [t, from, to, from], {
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
      });
    }
  };

  const effectiveT = locked && lockedValue !== null ? lockedValue : t;
  const result = config.compute(effectiveT);

  return (
    <div
      className={`divider-readout divider-readout--${metric}`}
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      role="group"
      aria-label={`${config.label} readout: ${result.display}. ${config.caption}`}
    >
      <div className="divider-readout__row">
        <div className="divider-readout__panel">
          <span className="divider-readout__label">{config.label}</span>
          <div className="divider-readout__value-line">
            <span className="divider-readout__value">{result.display}</span>
            <button
              type="button"
              className={`divider-readout__lock ${locked ? "is-locked" : ""}`}
              onClick={toggleLock}
              aria-pressed={locked}
              aria-label={locked ? `Unlock ${config.label} — resume live sweep` : `Lock ${config.label} at its current value`}
              title={locked ? "Unlock" : "Lock this value"}
            >
              {locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </div>
        </div>

        <div className="divider-readout__visual">
          {metric === "rssi" && <RssiVisual rssi={result.rssi} />}
          {metric === "snr" && <SnrVisual t={effectiveT} />}
          {metric === "latency" && <LatencyVisual latency={result.latency} />}
        </div>
      </div>

      <p className="divider-readout__caption">
        {config.caption}
        {locked && <span className="divider-readout__locked-hint"> — locked in, click the pin to release.</span>}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CHANNEL-REUSE / COLLISION DEMO — two independent +/- steppers, no
// cursor tracking. Same channel = visible interference; different
// channels = clean. This is the WiFi-router problem everyone has lived
// through without knowing why.
// ═══════════════════════════════════════════════════════════════════

const CHANNEL_MIN = 1;
const CHANNEL_MAX = 11;
const NON_OVERLAPPING = [1, 6, 11];

function ChannelStepper({ label, value, onChange, accent }) {
  return (
    <div className={`channel-cell channel-cell--${accent}`}>
      <span className="channel-cell__label">{label}</span>
      <div className="channel-cell__stepper">
        <button
          type="button"
          onClick={() => onChange(Math.max(CHANNEL_MIN, value - 1))}
          aria-label={`Decrease ${label} channel`}
          disabled={value <= CHANNEL_MIN}
        >
          <Minus size={12} />
        </button>
        <span className="channel-cell__value">Ch {value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(CHANNEL_MAX, value + 1))}
          aria-label={`Increase ${label} channel`}
          disabled={value >= CHANNEL_MAX}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

function ChannelReuseReadout() {
  const [chA, setChA] = useState(6);
  const [chB, setChB] = useState(6); // start colliding — the problem, right away
  const colliding = chA === chB;
  const bothNonOverlapping = NON_OVERLAPPING.includes(chA) && NON_OVERLAPPING.includes(chB);

  return (
    <div className="divider-readout divider-readout--channel-reuse" role="group" aria-label="Channel reuse interference demo">
      <div className="divider-readout__row channel-reuse-row">
        <ChannelStepper label="Router A" value={chA} onChange={setChA} accent="a" />

        <svg viewBox="0 0 100 46" className="channel-overlap" aria-hidden="true">
          <circle cx="38" cy="23" r="17" className="channel-circle channel-circle--a" />
          <circle cx="62" cy="23" r="17" className="channel-circle channel-circle--b" />
          {colliding ? (
            <motion.g
              key="collision"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            >
              <line x1="44" y1="16" x2="56" y2="30" className="channel-x" />
              <line x1="56" y1="16" x2="44" y2="30" className="channel-x" />
            </motion.g>
          ) : (
            <motion.circle
              key="clean"
              cx="50"
              cy="23"
              r="3"
              className="channel-check-dot"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </svg>

        <ChannelStepper label="Router B" value={chB} onChange={setChB} accent="b" />
      </div>

      <div className={`channel-status ${colliding ? "is-bad" : "is-good"}`}>
        {colliding ? "✕ Interference — same channel" : "✓ Clean — no overlap"}
        {!colliding && bothNonOverlapping && <span className="channel-status-note"> (both non-overlapping)</span>}
      </div>

      <p className="divider-readout__caption divider-readout__caption--always">
        Neighboring WiFi routers on the same channel interfere with each other — that&apos;s why routers
        auto-select non-overlapping channels like 1, 6, or 11.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN — dispatches to the cursor-driven readouts or the channel demo.
// ═══════════════════════════════════════════════════════════════════

function DividerReadout({ metric }) {
  if (metric === "channel-reuse") return <ChannelReuseReadout />;
  return <CursorReadout metric={metric} />;
}

export default DividerReadout;
