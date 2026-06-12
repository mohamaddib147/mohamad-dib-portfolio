// Contact — The Receiver
// Signal travels left→right, flattens to clean line, pulses at endpoint.
// "ESTABLISH LINK" sends the final packet.

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Phone, UserRound, Link, MapPin, Briefcase, Languages } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────
const languages      = ["Arabic", "English", "Swedish", "French (Basic)"];
const primaryContacts = [
  { label: "Email",  value: "mohammaddeeb147@gmail.com", href: "mailto:mohammaddeeb147@gmail.com", icon: Mail },
  { label: "Phone",  value: "+961 79 067 170",           href: "tel:+96179067170",                icon: Phone },
];
const profileLinks = [
  { label: "LinkedIn", value: "mohamad-dib-b51286271",   href: "https://www.linkedin.com/in/mohamad-dib-b51286271", icon: UserRound },
  { label: "GitHub",   value: "github.com/mohamaddib147", href: "https://github.com/mohamaddib147",                 icon: Link },
];
const snapshotItems = [
  { label: "Location",     value: "Saida / Beirut, Lebanon",                              icon: MapPin },
  { label: "Availability", value: "Open to relocation and engineering-focused opportunities.", icon: Briefcase },
];

// ── RX Waveform Canvas ────────────────────────────────────────────────────
// Phase 1: noisy sine travels right across canvas
// Phase 2: wave flattens to a clean horizontal line (signal lock)
// Phase 3: gentle pulse bloom at the right endpoint
function RXCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);
  const phaseRef  = useRef(0); // 0=traveling 1=locking 2=locked
  const lockRef   = useRef(0); // 0→1 lerp progress during lock phase

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function tick() {
      const W = canvas.width;
      const H = canvas.height;
      const CY = H / 2;
      tRef.current += 0.022;
      const t = tRef.current;

      // Phase transitions
      if (phaseRef.current === 0 && t > 5.5) phaseRef.current = 1;
      if (phaseRef.current === 1) {
        lockRef.current = Math.min(1, lockRef.current + 0.012);
        if (lockRef.current >= 1) phaseRef.current = 2;
      }

      ctx.clearRect(0, 0, W, H);

      const lock = lockRef.current;

      // ── Draw waveform ──
      ctx.beginPath();
      const STEPS = 320;
      for (let i = 0; i <= STEPS; i++) {
        const x   = (i / STEPS) * W;
        const nx  = i / STEPS; // 0→1

        // Noise amplitude: fades out left-to-right as lock increases
        const noiseAmp = (1 - lock) * 28 * Math.max(0, 1 - nx * 1.1);

        // Main sine
        const sine  = Math.sin(nx * Math.PI * 7 - t * 3.2) * 22 * (1 - lock * nx);
        // High-freq noise overlay
        const noise = Math.sin(nx * Math.PI * 28 - t * 9) * noiseAmp * 0.4
                    + Math.sin(nx * Math.PI * 14 + t * 5) * noiseAmp * 0.6;

        const y = CY + sine + noise;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      // Stroke gradient: purple-noise → cyan-clean
      const wGrad = ctx.createLinearGradient(0, 0, W, 0);
      wGrad.addColorStop(0,      `rgba(168,85,247,${0.55 * (1 - lock)})`);
      wGrad.addColorStop(0.35,   `rgba(56,189,248,${0.55 + lock * 0.35})`);
      wGrad.addColorStop(1,      `rgba(56,189,248,${0.85 + lock * 0.15})`);
      ctx.strokeStyle = wGrad;
      ctx.lineWidth   = 1.6;
      ctx.shadowColor = `rgba(56,189,248,${0.25 + lock * 0.45})`;
      ctx.shadowBlur  = 8 + lock * 18;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // ── Endpoint pulse bloom (phase 2) ──
      if (phaseRef.current === 2) {
        const pulse = (Math.sin(t * 4) * 0.5 + 0.5);
        const ex = W - 18;
        const ey = CY;

        // Outer ring
        ctx.beginPath();
        ctx.arc(ex, ey, 14 + pulse * 12, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,${0.12 + pulse * 0.12})`;
        ctx.lineWidth   = 1;
        ctx.stroke();

        // Mid ring
        ctx.beginPath();
        ctx.arc(ex, ey, 7 + pulse * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,${0.3 + pulse * 0.2})`;
        ctx.lineWidth   = 1.2;
        ctx.stroke();

        // Core dot
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${0.85 + pulse * 0.15})`;
        ctx.shadowColor = "rgba(56,189,248,0.8)";
        ctx.shadowBlur  = 12;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    tick();
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [active]);

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
        opacity: 0.38,
      }}
    />
  );
}

// ── Signal Status Bar ─────────────────────────────────────────────────────
function SignalStatusBar({ active }) {
  const [phase, setPhase] = useState(0); // 0=scanning 1=locked
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t1 = setTimeout(() => setPhase(1), 5800);
    // Byte counter ticks up
    let n = 0;
    const iv = setInterval(() => {
      n += Math.floor(Math.random() * 128 + 64);
      setCount(n);
      if (n > 12800) clearInterval(iv);
    }, 80);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, [active]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "7px 14px",
      borderRadius: 999,
      border: `1px solid ${phase === 1 ? "rgba(34,197,94,0.35)" : "rgba(56,189,248,0.25)"}`,
      background: phase === 1 ? "rgba(34,197,94,0.06)" : "rgba(56,189,248,0.05)",
      fontSize: "0.72rem",
      fontFamily: "monospace",
      letterSpacing: "0.08em",
      transition: "all 0.6s ease",
      width: "fit-content",
      marginBottom: 18,
    }}>
      {/* Animated scan dot */}
      <span style={{
        width: 7, height: 7,
        borderRadius: "50%",
        background: phase === 1 ? "#22c55e" : "#38bdf8",
        boxShadow: phase === 1 ? "0 0 10px rgba(34,197,94,0.7)" : "0 0 10px rgba(56,189,248,0.7)",
        animation: phase === 0 ? "rxPulse 1.1s ease-in-out infinite" : "none",
        transition: "background 0.6s ease, box-shadow 0.6s ease",
      }} />
      <span style={{ color: phase === 1 ? "#86efac" : "#7fd4ff" }}>
        {phase === 0 ? "SCANNING... RX CHANNEL OPEN" : "SIGNAL LOCKED — READY TO RECEIVE"}
      </span>
      <span style={{ color: "rgba(56,189,248,0.45)", marginLeft: 6 }}>
        {count.toLocaleString()} B
      </span>
    </div>
  );
}

// ── ESTABLISH LINK Button ─────────────────────────────────────────────────
function EstablishLink() {
  const [sent, setSent] = useState(false);

  return (
    <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
      <p style={{ color: "rgba(149,194,220,0.7)", fontSize: "0.8rem", fontFamily: "monospace", letterSpacing: "0.06em" }}>
        TX ENDPOINT READY — AWAITING HANDSHAKE
      </p>
      <motion.a
        href="mailto:mohammaddeeb147@gmail.com"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setSent(true)}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 28px",
          borderRadius: 999,
          background: sent ? "rgba(34,197,94,0.12)" : "rgba(56,189,248,0.12)",
          border: `1.5px solid ${sent ? "rgba(34,197,94,0.55)" : "rgba(56,189,248,0.55)"}`,
          color: sent ? "#86efac" : "#38bdf8",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: "0.95rem",
          letterSpacing: "0.12em",
          textDecoration: "none",
          overflow: "hidden",
          transition: "background 0.4s ease, border-color 0.4s ease, color 0.4s ease",
        }}
      >
        {/* Ripple ring on hover */}
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          whileHover={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            border: "1.5px solid rgba(56,189,248,0.45)",
            pointerEvents: "none",
          }}
        />

        {/* Antenna SVG icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="14" />
          <path d="M6 8a6 6 0 0 0 12 0" />
          <path d="M3 5a11 11 0 0 0 18 0" />
          <line x1="12" y1="14" x2="8" y2="22" />
          <line x1="12" y1="14" x2="16" y2="22" />
        </svg>

        {sent ? "PACKET SENT — ACK PENDING" : "ESTABLISH LINK"}
      </motion.a>

      {sent && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "rgba(134,239,172,0.7)", letterSpacing: "0.06em" }}
        >
          ✓ SYN sent → awaiting SYN-ACK from receiver
        </motion.p>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────
function Contact() {
  const sectionRef = useRef(null);
  const inView     = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="portfolio-data-section contact-section"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Injected keyframes for status-dot pulse */}
      <style>{`
        @keyframes rxPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(0.7); }
        }
      `}</style>

      {/* RX waveform canvas — activates when section enters view */}
      <RXCanvas active={inView} />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker">The Receiver</p>
        <h2>Open to engineering, software, and infrastructure-focused opportunities.</h2>

        {/* Signal status bar */}
        <SignalStatusBar active={inView} />

        <p className="section-intro" style={{ marginBottom: 32 }}>
          Based in Lebanon and open to relocation. Signal resolved — all channels clear.
          Interested in software development, networking, communication systems,
          technical support, and security-oriented engineering environments.
        </p>

        {/* Main contact grid */}
        <div className="contact-grid refined-contact-grid upgraded-contact-grid">

          {/* Left — primary contact */}
          <motion.div
            className="contact-card contact-primary-card"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="contact-card-heading">
              <h3>Primary Contact</h3>
              <p className="contact-support-text">
                For opportunities, collaboration, or technical roles — fastest ways to reach me.
              </p>
            </div>

            <div className="contact-link-list contact-link-list-primary">
              {primaryContacts.map((item, i) => {
                const Icon = item.icon;
                return (
                  <a key={i} href={item.href} className="contact-link-card contact-link-card-primary">
                    <div className="contact-link-top">
                      <span className="contact-link-icon"><Icon size={16} strokeWidth={2} /></span>
                      <span className="contact-link-label">{item.label}</span>
                    </div>
                    <span className="contact-link-value">{item.value}</span>
                  </a>
                );
              })}
            </div>

            <div className="contact-subsection">
              <span className="contact-mini-label">Professional Profiles</span>
              <div className="contact-link-list">
                {profileLinks.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="contact-link-card">
                      <div className="contact-link-top">
                        <span className="contact-link-icon"><Icon size={16} strokeWidth={2} /></span>
                        <span className="contact-link-label">{item.label}</span>
                      </div>
                      <span className="contact-link-value">{item.value}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* ESTABLISH LINK CTA */}
            <EstablishLink />
          </motion.div>

          {/* Right — profile snapshot */}
          <motion.div
            className="contact-card contact-side-card contact-side-card-light"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <h3>Profile Snapshot</h3>

            <div className="contact-snapshot-list">
              {snapshotItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div className="contact-snapshot-item" key={i}>
                    <span className="contact-snapshot-icon"><Icon size={16} strokeWidth={2} /></span>
                    <div>
                      <span className="contact-mini-label">{item.label}</span>
                      <p>{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="contact-mini-block">
              <span className="contact-mini-label">Focus Areas</span>
              <p>Software development, communication systems, networking, security, IoT, technical support, and infrastructure.</p>
            </div>

            <div className="contact-mini-block">
              <div className="contact-language-heading">
                <span className="contact-link-icon"><Languages size={16} strokeWidth={2} /></span>
                <span className="contact-mini-label">Languages</span>
              </div>
              <div className="language-tags">
                {languages.map((lang, i) => (
                  <span className="language-tag" key={i}>{lang}</span>
                ))}
              </div>
            </div>

            {/* Transmission log */}
            <div className="contact-mini-block" style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="contact-mini-label" style={{ marginBottom: 10, display: "block" }}>TX / RX Log</span>
              {[
                { dir: "RX", msg: "Portfolio loaded successfully" },
                { dir: "RX", msg: "Signal quality: excellent" },
                { dir: "TX", msg: "Ready to negotiate connection" },
              ].map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: entry.dir === "RX" ? -10 : 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 7,
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    color: entry.dir === "RX" ? "rgba(56,189,248,0.65)" : "rgba(34,197,94,0.65)",
                  }}
                >
                  <span style={{ fontWeight: 700, opacity: 0.9 }}>[{entry.dir}]</span>
                  <span>{entry.msg}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default Contact;
