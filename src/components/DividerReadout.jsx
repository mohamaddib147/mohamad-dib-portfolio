import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { Lock, Unlock, Minus, Plus, Router, Smartphone } from "lucide-react";

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
// SHANNON CAPACITY DIAL — a genuine two-parameter instrument. Cursor
// x controls bandwidth, cursor y controls SNR; both feed the actual
// Shannon-Hartley equation into a speedometer-style gauge.
// ═══════════════════════════════════════════════════════════════════

function ShannonReadout() {
  const containerRef = useRef(null);
  const progressX = useMotionValue(0.45);
  const progressY = useMotionValue(0.5);
  const springX = useSpring(progressX, { stiffness: 90, damping: 20 });
  const springY = useSpring(progressY, { stiffness: 90, damping: 20 });
  const idleControlsRef = useRef([]);
  const [tx, setTx] = useState(progressX.get());
  const [ty, setTy] = useState(progressY.get());
  const [locked, setLocked] = useState(false);
  const [lockedVals, setLockedVals] = useState(null);

  useEffect(() => {
    const unsubX = springX.on("change", (v) => setTx(Math.min(Math.max(v, 0), 1)));
    const unsubY = springY.on("change", (v) => setTy(Math.min(Math.max(v, 0), 1)));
    return () => {
      unsubX();
      unsubY();
    };
  }, [springX, springY]);

  const startIdle = (fromX, fromY) => {
    const cx = animate(progressX, [fromX, 0.2, 0.8, 0.2], { duration: 9, repeat: Infinity, ease: "easeInOut" });
    const cy = animate(progressY, [fromY, 0.3, 0.75, 0.3], { duration: 9, repeat: Infinity, ease: "easeInOut" });
    idleControlsRef.current = [cx, cy];
  };
  const stopIdle = () => idleControlsRef.current.forEach((c) => c?.stop());

  useEffect(() => {
    startIdle(0.2, 0.3);
    return stopIdle;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMove = (e) => {
    if (locked) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const xNorm = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const yNorm = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    progressX.set(xNorm);
    progressY.set(1 - yNorm); // top = high SNR
  };

  const handleEnter = () => {
    if (!locked) stopIdle();
  };
  const handleLeave = () => {
    if (!locked) startIdle(tx, ty);
  };
  const toggleLock = () => {
    if (!locked) {
      stopIdle();
      setLockedVals({ tx, ty });
      setLocked(true);
    } else {
      setLocked(false);
      startIdle(tx, ty);
    }
  };

  const effTx = locked && lockedVals ? lockedVals.tx : tx;
  const effTy = locked && lockedVals ? lockedVals.ty : ty;

  const bandwidth = 1 + effTx * 39; // 1 .. 40 MHz
  const snrDb = effTy * 30; // 0 .. 30 dB
  const snrLinear = 10 ** (snrDb / 10);
  const capacity = bandwidth * Math.log2(1 + snrLinear); // Shannon-Hartley, Mbps

  const maxCapacity = 260;
  const gaugePct = Math.min(1, capacity / maxCapacity);
  const angleDeg = 180 - gaugePct * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const pivotX = 50;
  const pivotY = 48;
  const needleLen = 32;
  const tipX = pivotX + needleLen * Math.cos(angleRad);
  const tipY = pivotY - needleLen * Math.sin(angleRad);

  return (
    <div
      className="divider-readout divider-readout--shannon"
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      role="group"
      aria-label={`Shannon channel capacity: ${Math.round(capacity)} Mbps, from ${Math.round(bandwidth)} MHz bandwidth and ${snrDb.toFixed(1)} dB SNR`}
    >
      <div className="divider-readout__row shannon-row">
        <div className="shannon-inputs">
          <span className="shannon-input-line">
            B <strong>{Math.round(bandwidth)} MHz</strong>
          </span>
          <span className="shannon-input-line">
            SNR <strong>{snrDb.toFixed(1)} dB</strong>
          </span>
        </div>

        <div className="shannon-gauge-block">
          <svg viewBox="0 0 100 56" className="shannon-gauge" aria-hidden="true">
            <path d="M10 48 A40 40 0 0 1 90 48" className="gauge-track" pathLength="100" fill="none" />
            <path
              d="M10 48 A40 40 0 0 1 90 48"
              className="gauge-fill"
              pathLength="100"
              fill="none"
              style={{ strokeDasharray: 100, strokeDashoffset: 100 - gaugePct * 100 }}
            />
            <line x1={pivotX} y1={pivotY} x2={tipX} y2={tipY} className="gauge-needle" />
            <circle cx={pivotX} cy={pivotY} r="3" className="gauge-pivot" />
          </svg>

          <div className="divider-readout__value-line shannon-value-line">
            <span className="divider-readout__value">{Math.round(capacity)} Mbps</span>
            <button
              type="button"
              className={`divider-readout__lock ${locked ? "is-locked" : ""}`}
              onClick={toggleLock}
              aria-pressed={locked}
              aria-label={locked ? "Unlock Shannon capacity — resume live sweep" : "Lock Shannon capacity at its current value"}
              title={locked ? "Unlock" : "Lock this value"}
            >
              {locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </div>
          <span className="divider-readout__label">SHANNON CAPACITY</span>
        </div>
      </div>

      <p className="divider-readout__caption">
        Shannon&apos;s law: capacity = bandwidth × log₂(1 + SNR). This is the hard theoretical ceiling on
        wireless speed — no protocol can beat it, only approach it.
        {locked && <span className="divider-readout__locked-hint"> — locked in, click the pin to release.</span>}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BEAMFORMING — a steerable directional lobe over a small antenna
// array. Cursor x steers the beam angle in real time.
// ═══════════════════════════════════════════════════════════════════

const BEAM_ELEMENTS = [-20, -10, 0, 10, 20];
const BEAM_PETAL_PATH = "M0,0 C-13,-9 -9,-27 0,-33 C9,-27 13,-9 0,0 Z";

function BeamformingReadout() {
  const containerRef = useRef(null);
  const progress = useMotionValue(0.5);
  const springProgress = useSpring(progress, { stiffness: 90, damping: 20 });
  const idleControlsRef = useRef(null);
  const [t, setT] = useState(progress.get());
  const [locked, setLocked] = useState(false);
  const [lockedT, setLockedT] = useState(null);

  useEffect(() => {
    const unsub = springProgress.on("change", (v) => setT(Math.min(Math.max(v, 0), 1)));
    return unsub;
  }, [springProgress]);

  const startIdle = (from) => {
    idleControlsRef.current = animate(progress, [from, 0.15, 0.85, 0.15], {
      duration: 7.5,
      repeat: Infinity,
      ease: "easeInOut",
    });
  };

  useEffect(() => {
    startIdle(0.5);
    return () => idleControlsRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMove = (e) => {
    if (locked) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    const xNorm = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    progress.set(xNorm);
  };
  const handleEnter = () => {
    if (!locked) idleControlsRef.current?.stop();
  };
  const handleLeave = () => {
    if (!locked) startIdle(t);
  };
  const toggleLock = () => {
    if (!locked) {
      idleControlsRef.current?.stop();
      setLockedT(t);
      setLocked(true);
    } else {
      setLocked(false);
      startIdle(t);
    }
  };

  const effT = locked && lockedT !== null ? lockedT : t;
  const angleDeg = (effT - 0.5) * 120; // -60 .. +60 degrees

  return (
    <div
      className="divider-readout divider-readout--beamforming"
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      role="group"
      aria-label={`Beamforming steering angle: ${Math.round(angleDeg)} degrees`}
    >
      <div className="divider-readout__row">
        <div className="divider-readout__panel">
          <span className="divider-readout__label">STEERING ANGLE</span>
          <div className="divider-readout__value-line">
            <span className="divider-readout__value">
              {angleDeg >= 0 ? "+" : ""}
              {Math.round(angleDeg)}°
            </span>
            <button
              type="button"
              className={`divider-readout__lock ${locked ? "is-locked" : ""}`}
              onClick={toggleLock}
              aria-pressed={locked}
              aria-label={locked ? "Unlock beam angle — resume live sweep" : "Lock beam angle at its current value"}
              title={locked ? "Unlock" : "Lock this value"}
            >
              {locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </div>
        </div>

        <svg viewBox="0 0 100 56" className="beam-visual" aria-hidden="true">
          <g transform={`translate(50 50) rotate(${angleDeg})`}>
            <path d={BEAM_PETAL_PATH} className="beam-lobe" />
          </g>
          {BEAM_ELEMENTS.map((dx, i) => (
            <circle key={i} cx={50 + dx} cy="50" r="2.6" className="beam-element" />
          ))}
        </svg>
      </div>

      <p className="divider-readout__caption">
        Beamforming shifts the timing of each antenna&apos;s signal so they combine only in one direction —
        the same trick used to focus a 5G signal at your specific phone instead of broadcasting everywhere.
        {locked && <span className="divider-readout__locked-hint"> — locked in, click the pin to release.</span>}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// WIFI 4-WAY HANDSHAKE — a real named protocol, sequenced. Auto-plays
// the first time it scrolls into view, then click (or Enter/Space)
// replays it.
// ═══════════════════════════════════════════════════════════════════

const HANDSHAKE_STEPS = [
  { from: "ap", label: "ANonce" },
  { from: "client", label: "SNonce + MIC" },
  { from: "ap", label: "GTK + MIC" },
  { from: "client", label: "ACK" },
];

function WifiHandshakeReadout() {
  const [step, setStep] = useState(0); // 0 = idle, 1..4 = message steps, 5 = connected
  const timeoutsRef = useRef([]);
  const hasPlayedRef = useRef(false);

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const play = () => {
    clearTimers();
    setStep(0);
    HANDSHAKE_STEPS.forEach((_, i) => {
      const id = setTimeout(() => setStep(i + 1), 450 + i * 650);
      timeoutsRef.current.push(id);
    });
    const doneId = setTimeout(() => setStep(5), 450 + HANDSHAKE_STEPS.length * 650);
    timeoutsRef.current.push(doneId);
  };

  useEffect(() => clearTimers, []);

  const handleViewportEnter = () => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    play();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      play();
    }
  };

  const currentMsg = step >= 1 && step <= 4 ? HANDSHAKE_STEPS[step - 1] : null;
  const connected = step === 5;

  return (
    <motion.div
      className="divider-readout divider-readout--handshake"
      role="button"
      tabIndex={0}
      onClick={play}
      onKeyDown={handleKeyDown}
      onViewportEnter={handleViewportEnter}
      viewport={{ once: true, margin: "-40px" }}
      aria-label="WiFi 4-way handshake demo — click to replay"
    >
      <div className="divider-readout__row handshake-row">
        <div className="handshake-node handshake-node--ap">
          <Router size={18} />
          <span>AP</span>
        </div>

        <svg viewBox="0 0 100 30" className="handshake-track" aria-hidden="true">
          <line x1="10" y1="15" x2="90" y2="15" className="handshake-line" />
          {currentMsg && (
            <motion.circle
              key={step}
              r="3"
              cy="15"
              className="handshake-packet"
              initial={{ cx: currentMsg.from === "ap" ? 10 : 90, opacity: 0 }}
              animate={{ cx: currentMsg.from === "ap" ? 90 : 10, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          )}
          {connected && (
            <motion.circle
              cx="50"
              cy="15"
              r="3"
              className="handshake-connected-dot"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </svg>

        <div className="handshake-node handshake-node--client">
          <Smartphone size={18} />
          <span>Client</span>
        </div>
      </div>

      <div className={`handshake-status ${connected ? "is-good" : ""}`}>
        {connected
          ? "✓ Connected — PTK derived"
          : currentMsg
            ? `Step ${step}/4 — ${currentMsg.label}`
            : "Starting handshake…"}
      </div>

      <p className="divider-readout__caption divider-readout__caption--always">
        The real handshake your device does every time it joins a WiFi network — four messages to prove
        both sides know the password without ever sending it over the air. Click to replay.
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN — dispatches to the cursor-driven readouts or a bespoke demo.
// ═══════════════════════════════════════════════════════════════════

function DividerReadout({ metric }) {
  if (metric === "channel-reuse") return <ChannelReuseReadout />;
  if (metric === "shannon") return <ShannonReadout />;
  if (metric === "beamforming") return <BeamformingReadout />;
  if (metric === "wifi-handshake") return <WifiHandshakeReadout />;
  return <CursorReadout metric={metric} />;
}

export default DividerReadout;
