import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function SectionDivider({ variant = "default" }) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const nodeProgress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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
      className={`section-divider section-divider--full divider divider--${variant}`}
      role="separator"
      aria-hidden="true"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="divider__blend divider__blend--top" />
      <div className="divider__blend divider__blend--bottom" />

      <div className="divider__inner">
        <div className="divider__line divider__line--left" />

        <div className="divider__matrix-container">
          <svg
            viewBox="0 0 720 80"
            className="divider__rf-matrix"
            preserveAspectRatio="xMidYMid meet"
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
          </svg>

          <div className="divider__center-motifs">
            <span className="divider__motif divider__motif--a" />
            <span className="divider__motif divider__motif--b" />
            <span className="divider__motif divider__motif--c" />
          </div>
        </div>

        <div className="divider__line divider__line--right" />
      </div>
    </motion.div>
  );
}

export default SectionDivider;