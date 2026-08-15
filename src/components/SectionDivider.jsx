import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
  useMotionValue,
} from "framer-motion";

const FEATURED_VARIANT = "projects-signal-lab";

// Symmetric packet start positions for the featured data-burst divider,
// in the shared 720x80 viewBox — three on each side, converging to (360, 40).
const BURST_PACKETS = [
  { id: "l1", startX: 60, startY: 30 },
  { id: "l2", startX: 140, startY: 52 },
  { id: "l3", startX: 230, startY: 24 },
  { id: "r1", startX: 660, startY: 30 },
  { id: "r2", startX: 580, startY: 52 },
  { id: "r3", startX: 490, startY: 24 },
];

function SectionDivider({ variant = "default" }) {
  const containerRef = useRef(null);
  const matrixRef = useRef(null);
  const isFeatured = variant === FEATURED_VARIANT;

  const [burstActive, setBurstActive] = useState(false);
  const burstTimeoutRef = useRef(null);
  // Ref, not state — the ambient-vs-cursor gate must be readable synchronously
  // inside the motion-value subscription below. React state would lag by a
  // render, letting a stale ambient update briefly fight the cursor's value.
  const isHoveringRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const nodeProgress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // ── #3: the wave as a live instrument ──────────────────────────────────
  // Ambient energy driven by scroll velocity — fling the page and the wave
  // compresses tight and tall; scroll gently and it relaxes back to calm,
  // wide swings. Hovering the divider hands control to the cursor instead:
  // horizontal position tunes "frequency" (tight vs. relaxed), vertical
  // position tunes "amplitude" (tall vs. flat) — a signal-generator knob.
  const rawVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(rawVelocity, { stiffness: 45, damping: 22, mass: 0.4 });
  const velocityMag = useTransform(smoothVelocity, (v) => Math.min(Math.abs(v), 3.2));
  const ambientScaleX = useTransform(velocityMag, [0, 3.2], [1, 0.72]);
  const ambientScaleY = useTransform(velocityMag, [0, 3.2], [1, 1.3]);

  const waveScaleX = useMotionValue(1);
  const waveScaleY = useMotionValue(1);
  const springScaleX = useSpring(waveScaleX, { stiffness: 120, damping: 18 });
  const springScaleY = useSpring(waveScaleY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const unsubX = ambientScaleX.on("change", (v) => {
      if (!isHoveringRef.current) waveScaleX.set(v);
    });
    const unsubY = ambientScaleY.on("change", (v) => {
      if (!isHoveringRef.current) waveScaleY.set(v);
    });
    return () => {
      unsubX();
      unsubY();
    };
  }, [ambientScaleX, ambientScaleY, waveScaleX, waveScaleY]);

  const handlePointerMove = useCallback(
    (e) => {
      const el = matrixRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const xNorm = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const yNorm = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
      waveScaleX.set(1.28 - xNorm * 0.6); // left = relaxed, right = tight
      waveScaleY.set(1.5 - yNorm * 0.95); // top = tall, bottom = flat
    },
    [waveScaleX, waveScaleY],
  );

  const handlePointerEnter = useCallback(() => {
    isHoveringRef.current = true;
  }, []);
  const handlePointerLeave = useCallback(() => {
    isHoveringRef.current = false;
  }, []);

  // ── #4: click-to-trigger data burst (featured divider only) ────────────
  const triggerBurst = useCallback(() => {
    if (!isFeatured || burstActive) return;
    setBurstActive(true);
    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
    burstTimeoutRef.current = setTimeout(() => setBurstActive(false), 1300);
  }, [isFeatured, burstActive]);

  useEffect(() => () => {
    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
  }, []);

  const handleFeaturedKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerBurst();
      }
    },
    [triggerBurst],
  );

  const paths = useMemo(() => {
    const width = 720;
    const baseline = 40;
    const segments = 6;
    const segmentWidth = width / segments;

    let carrier = `M 0 ${baseline}`;
    let harmonic = `M 0 ${baseline}`;
    let primary = `M 0 ${baseline}`;

    for (let i = 0; i < segments; i += 1) {
      const startX = i * segmentWidth;
      const midX = startX + segmentWidth / 2;
      const endX = startX + segmentWidth;

      carrier += ` Q ${startX + segmentWidth * 0.25} ${baseline - 14} ${midX} ${baseline}
                   Q ${startX + segmentWidth * 0.75} ${baseline + 14} ${endX} ${baseline}`;

      harmonic += ` Q ${startX + segmentWidth * 0.25} ${baseline + 10} ${midX} ${baseline}
                    Q ${startX + segmentWidth * 0.75} ${baseline - 10} ${endX} ${baseline}`;

      primary += ` C ${startX + segmentWidth * 0.18} ${baseline - 26},
                   ${startX + segmentWidth * 0.32} ${baseline - 26},
                   ${midX} ${baseline}
                   C ${startX + segmentWidth * 0.68} ${baseline + 26},
                   ${startX + segmentWidth * 0.82} ${baseline + 26},
                   ${endX} ${baseline}`;
    }

    return { carrier, harmonic, primary };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`section-divider section-divider--full divider divider--${variant} ${
        isFeatured ? "divider--featured" : ""
      }`}
      role={isFeatured ? "button" : "separator"}
      tabIndex={isFeatured ? 0 : undefined}
      aria-hidden={isFeatured ? undefined : true}
      aria-label={
        isFeatured ? "Signal Lab is next — click to trigger the data burst" : undefined
      }
      onClick={isFeatured ? triggerBurst : undefined}
      onKeyDown={isFeatured ? handleFeaturedKeyDown : undefined}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="divider__blend divider__blend--top" />
      <div className="divider__blend divider__blend--bottom" />

      <div className="divider__inner">
        <div className="divider__line divider__line--left" />

        <div
          className={`divider__matrix-container ${isFeatured ? "divider__matrix-container--featured" : ""}`}
          ref={matrixRef}
          onMouseMove={handlePointerMove}
          onMouseEnter={handlePointerEnter}
          onMouseLeave={handlePointerLeave}
        >
          <motion.svg
            viewBox="0 0 720 80"
            className="divider__rf-matrix"
            preserveAspectRatio="xMidYMid meet"
            style={{
              scaleX: springScaleX,
              scaleY: springScaleY,
              transformOrigin: "50% 50%",
            }}
          >
            <path
              d={paths.carrier}
              fill="none"
              className="matrix-wave wave-carrier"
            />

            <path
              d={paths.harmonic}
              fill="none"
              className="matrix-wave wave-harmonic"
            />

            <path
              id={`wavePath-${variant}`}
              d={paths.primary}
              fill="none"
              className="matrix-wave wave-primary-path"
            />

            <motion.circle
              r="4.5"
              className="matrix-packet-node"
              style={{
                offsetPath: `path("${paths.primary}")`,
                offsetDistance: nodeProgress,
              }}
            />
          </motion.svg>

          {isFeatured ? (
            <svg
              viewBox="0 0 720 80"
              className="divider__burst-layer"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {BURST_PACKETS.map((packet, i) => (
                <motion.circle
                  key={packet.id}
                  r="3"
                  className="burst-packet"
                  initial={{ cx: packet.startX, cy: packet.startY, opacity: 0.55 }}
                  animate={
                    burstActive
                      ? {
                          cx: 360,
                          cy: 40,
                          opacity: [0.85, 1, 0],
                          transition: { duration: 0.55, ease: "easeIn", delay: i * 0.02 },
                        }
                      : {
                          cx: [packet.startX, packet.startX + (packet.startX < 360 ? 10 : -10), packet.startX],
                          cy: [packet.startY, packet.startY - 4, packet.startY],
                          opacity: [0.4, 0.7, 0.4],
                          transition: {
                            duration: 2.6 + i * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }
                  }
                />
              ))}

              <motion.circle
                cx="360"
                cy="40"
                r="3"
                className="burst-core"
                animate={
                  burstActive
                    ? {
                        r: [3, 3, 26],
                        opacity: [0, 1, 0],
                        transition: { duration: 0.5, ease: "easeOut", delay: 0.5 },
                      }
                    : { r: 3, opacity: 0 }
                }
              />

              <motion.circle
                cx="360"
                cy="40"
                r="4"
                className="burst-ring"
                animate={
                  burstActive
                    ? {
                        r: [4, 40],
                        opacity: [0.9, 0],
                        transition: { duration: 0.75, ease: "easeOut", delay: 0.55 },
                      }
                    : { r: 4, opacity: 0 }
                }
              />
            </svg>
          ) : null}

          <div className="divider__center-motifs">
            <span className="divider__motif divider__motif--a" />
            <span className="divider__motif divider__motif--b" />
            <span className="divider__motif divider__motif--c" />
          </div>

          {isFeatured && (
            <span className={`divider__burst-hint ${burstActive ? "is-hidden" : ""}`}>
              Click to sync ⚡
            </span>
          )}
        </div>

        <div className="divider__line divider__line--right" />
      </div>
    </motion.div>
  );
}

export default SectionDivider;
