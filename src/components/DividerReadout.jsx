import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";

// ═══════════════════════════════════════════════════════════════════
// MATH — real formulas, not decoration. Each metric is driven by a
// single normalized input t ∈ [0,1] (cursor position along the
// divider), mapped through the actual textbook equation.
// ═══════════════════════════════════════════════════════════════════

const SUPERSCRIPTS = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
function toSuperscript(n) {
  return String(n)
    .split("")
    .map((c) => SUPERSCRIPTS[c] ?? c)
    .join("");
}

// Abramowitz & Stegun 7.1.26 rational approximation of erfc(x).
function erfc(x) {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const ans =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t *
          (1.00002368 +
            t *
              (0.37409196 +
                t *
                  (0.09678418 +
                    t *
                      (-0.18628806 +
                        t *
                          (0.27886807 +
                            t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    );
  return x >= 0 ? ans : 2 - ans;
}
const qFunc = (x) => 0.5 * erfc(x / Math.SQRT2);

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
  ber: {
    label: "BER",
    caption:
      "As signal quality improves, bit errors drop exponentially — this exact curve (BER vs. SNR for BPSK) determines every wireless standard's range and speed.",
    idleRange: [0.5, 0.86],
    // BPSK bit-error rate: BER = Q(√(2·SNR_linear))
    compute(t) {
      const snrDb = t * 15; // 0 .. 15 dB
      const snrLinear = 10 ** (snrDb / 10);
      const ber = Math.max(1e-9, Math.min(0.5, qFunc(Math.sqrt(2 * snrLinear))));
      const exp = Math.floor(Math.log10(ber));
      const mantissa = ber / 10 ** exp;
      return { display: `${mantissa.toFixed(2)} × 10${toSuperscript(exp)}`, ber, snrDb };
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

// Stable per-bit thresholds so bits flip deterministically as BER crosses
// them, instead of flickering randomly on every render.
const BIT_THRESHOLDS = Array.from({ length: 14 }, (_, i) => ((i * 0.6180339887) % 1));

function BerVisual({ ber }) {
  // Real BER at good SNR is far too small to show in a 14-bit sample —
  // this exaggeration is purely visual; the readout above shows the truth.
  const visualErrorRate = Math.min(0.5, ber * 4000);
  return (
    <div className="ber-bits" aria-hidden="true">
      {BIT_THRESHOLDS.map((thresh, i) => (
        <span key={i} className={`ber-bit ${thresh < visualErrorRate ? "is-error" : ""}`} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

function DividerReadout({ metric }) {
  const config = useMemo(() => METRICS[metric], [metric]);
  const containerRef = useRef(null);
  const progress = useMotionValue((config.idleRange[0] + config.idleRange[1]) / 2);
  const springProgress = useSpring(progress, { stiffness: 90, damping: 20 });
  const idleControlsRef = useRef(null);
  const [t, setT] = useState(progress.get());

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
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const xNorm = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const yNorm = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    progress.set(config.invert ? 1 - yNorm : xNorm);
  };

  const handleEnter = () => {
    idleControlsRef.current?.stop();
  };

  const handleLeave = () => {
    const [from, to] = config.idleRange;
    idleControlsRef.current = animate(progress, [progress.get(), from, to, from], {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    });
  };

  const result = config.compute(t);

  return (
    <div
      className={`divider-readout divider-readout--${metric}`}
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      tabIndex={0}
      role="group"
      aria-label={`${config.label} readout: ${result.display}. ${config.caption}`}
    >
      <div className="divider-readout__row">
        <div className="divider-readout__panel">
          <span className="divider-readout__label">{config.label}</span>
          <span className="divider-readout__value">{result.display}</span>
        </div>

        <div className="divider-readout__visual">
          {metric === "rssi" && <RssiVisual rssi={result.rssi} />}
          {metric === "snr" && <SnrVisual t={t} />}
          {metric === "latency" && <LatencyVisual latency={result.latency} />}
          {metric === "ber" && <BerVisual ber={result.ber} />}
        </div>
      </div>

      <p className="divider-readout__caption">{config.caption}</p>
    </div>
  );
}

export default DividerReadout;
export { METRICS as DIVIDER_READOUT_METRICS };
