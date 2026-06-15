// Contact — The Receiver (Active RX Holographic Update)
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Phone, UserRound, MapPin, Briefcase, Languages } from "lucide-react";
import githubIcon from "../assets/logos/github-color-svgrepo-com.svg";

// ── Data ──────────────────────────────────────────────────────────────────
const languages = ["English", "Swedish", "Arabic"];

const primaryContacts = [
  { label: "Email", value: "mohammaddeeb147@gmail.com", href: "mailto:mohammaddeeb147@gmail.com", icon: Mail },
  { label: "Phone", value: "+961 79 067 170", href: "tel:+96179067170", icon: Phone },
];

const profileLinks = [
  {
    label: "LinkedIn",
    value: "Mohamad Dib",
    href: "https://www.linkedin.com/in/mohamad-dib-b51286271",
    icon: UserRound,
    type: "lucide",
  },
  {
    label: "GitHub",
    value: "GitHub",
    href: "https://github.com/mohamaddib147",
    icon: githubIcon,
    type: "image",
  },
];

const snapshotItems = [
  { label: "Location", value: "Saida / Beirut, Lebanon", icon: MapPin },
  { label: "Availability", value: "Open to engineering-focused opportunities.", icon: Briefcase },
];

// ── Live Telemetry Clock ──────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="telemetry-value" style={{ fontFamily: "monospace" }}>
      {time.toLocaleTimeString("en-US", { hour12: false })} EEST (UTC+3)
    </span>
  );
}

// ── RX Waveform Canvas (Spectrum Analyzer Upgrade) ────────────────────────
function RXCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);
  const dataParticles = useRef(
    Array.from({ length: 15 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.001 + Math.random() * 0.003,
      val: Math.random() > 0.5 ? "1" : "0",
    }))
  );

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function tick() {
      const W = canvas.width;
      const H = canvas.height;
      const CY = H / 2;
      tRef.current += 0.015;
      const t = tRef.current;

      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.03)";
      ctx.lineWidth = 1;

      for (let i = 0; i < W; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }

      for (let i = 0; i < H; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(W, i);
        ctx.stroke();
      }

      const drawWave = (amplitude, frequency, speed, color, lineWidth, opacity) => {
        ctx.beginPath();
        for (let i = 0; i <= W; i += 5) {
          const nx = i / W;
          const y =
            CY +
            Math.sin(nx * Math.PI * frequency - t * speed) * amplitude +
            Math.sin(nx * Math.PI * (frequency * 2.5) + t * (speed * 1.5)) * (amplitude * 0.3);

          i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = opacity;
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      drawWave(45, 4, 3, "#38bdf8", 1.5, 0.3);
      drawWave(25, 8, -4, "#818cf8", 2, 0.5);

      ctx.shadowColor = "rgba(56,189,248,0.8)";
      ctx.shadowBlur = 15;
      drawWave(15, 12, 6, "#38bdf8", 2.5, 0.9);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(56,189,248,0.6)";
      ctx.font = "10px monospace";

      dataParticles.current.forEach((p) => {
        p.x -= p.speed;
        if (p.x < 0) {
          p.x = 1;
          p.y = Math.random();
          p.val =
            Math.random() > 0.8
              ? `0x${Math.floor(Math.random() * 255).toString(16).toUpperCase()}`
              : Math.random() > 0.5
                ? "1"
                : "0";
        }

        const px = p.x * W;
        const py = p.y * H * 0.4 + CY * 0.6;
        ctx.fillText(p.val, px, py);
      });

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
        opacity: 0.6,
      }}
    />
  );
}

// ── Signal Status Bar ─────────────────────────────────────────────────────
function SignalStatusBar({ active }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    let n = 0;
    const iv = setInterval(() => {
      n += Math.floor(Math.random() * 256 + 12);
      setCount(n);
    }, 60);

    return () => clearInterval(iv);
  }, [active]);

  return (
    <div className="status-bar-container">
      <div className="status-ring-wrapper">
        <span className="status-dot"></span>
        <span className="status-ring ring-1"></span>
        <span className="status-ring ring-2"></span>
      </div>
      <span style={{ color: "#86efac" }}>SIGNAL LOCKED — READY TO RECEIVE</span>
      <span className="status-counter">{count.toLocaleString()} B</span>
    </div>
  );
}

// ── ESTABLISH LINK Button & Graphic ───────────────────────────────────────
function EstablishLink() {
  const [sent, setSent] = useState(false);

  return (
    <div className="establish-link-wrapper">
      <p className="tx-endpoint-text">TX ENDPOINT READY — AWAITING HANDSHAKE</p>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <motion.a
          href="mailto:mohammaddeeb147@gmail.com"
          whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setSent(true)}
          className={`establish-btn ${sent ? "sent" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="14" />
            <path d="M6 8a6 6 0 0 0 12 0" />
            <path d="M3 5a11 11 0 0 0 18 0" />
            <line x1="12" y1="14" x2="8" y2="22" />
            <line x1="12" y1="14" x2="16" y2="22" />
          </svg>
          {sent ? "PACKET SENT — ACK PENDING" : "ESTABLISH LINK"}
        </motion.a>

        <div className="connection-nodes">
          <span className="node"></span>
          <svg width="60" height="20" viewBox="0 0 60 20" className="node-wave">
            <path d="M0,10 Q15,0 30,10 T60,10" fill="none" stroke="rgba(56,189,248,0.5)" strokeWidth="1.5" />
            <path d="M0,10 Q15,20 30,10 T60,10" fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
          <span className="node node-pulse"></span>
        </div>
      </div>

      {sent && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: "0.72rem",
            fontFamily: "monospace",
            color: "rgba(134,239,172,0.8)",
            letterSpacing: "0.06em",
            marginTop: "10px",
          }}
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
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section id="contact" ref={sectionRef} className="portfolio-data-section contact-section holographic-section">
      <RXCanvas active={inView} />

      <motion.div
        className="portfolio-section-shell relative-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker text-cyan">The Receiver</p>
        <h2>Open to engineering, software, and infrastructure-focused opportunities.</h2>

        <SignalStatusBar active={inView} />

        <p className="section-intro" style={{ marginBottom: 32 }}>
          Based in Lebanon and open to relocation. Signal resolved — all channels clear.
          Interested in software development, networking, communication systems,
          technical support, and security-oriented environments.
        </p>

        <div className="contact-grid">
          <motion.div
            className="contact-card holo-card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="holo-card-inner">
              <div className="contact-card-heading">
                <h3>Primary Contact</h3>
                <p className="contact-support-text">
                  For opportunities, collaboration, or technical roles — fastest ways to reach me.
                </p>
              </div>

              <div className="contact-link-list">
                {primaryContacts.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <a key={i} href={item.href} className="contact-link-card holo-link">
                      <div className="contact-link-top">
                        <span className="contact-link-icon">
                          <Icon size={16} strokeWidth={2} />
                        </span>
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
                  {profileLinks.map((item, i) => (
                    <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="contact-link-card holo-link dark-holo">
                      <div className="contact-link-top">
                        <span className="contact-link-icon">
                          {item.type === "image" ? (
                            <img
                              src={item.icon}
                              alt={`${item.label} logo`}
                              width={16}
                              height={16}
                              style={{ display: "block", objectFit: "contain" }}
                            />
                          ) : (
                            <item.icon size={16} strokeWidth={2} />
                          )}
                        </span>
                        <span className="contact-link-label">{item.label}</span>
                      </div>
                      <span className="contact-link-value">{item.value}</span>
                    </a>
                  ))}
                </div>
              </div>

              <EstablishLink />
            </div>
          </motion.div>

          <motion.div
            className="contact-card holo-card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="holo-card-inner">
              <h3>Profile Snapshot</h3>

              <div className="contact-snapshot-list">
                {snapshotItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div className="contact-snapshot-item" key={i}>
                      <span className="contact-snapshot-icon">
                        <Icon size={16} strokeWidth={2} />
                      </span>
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
                <p className="focus-area-text">
                  Software development, communication systems, networking, security, IoT, technical support, and infrastructure.
                </p>
              </div>

              <div className="contact-mini-block">
                <div className="contact-language-heading">
                  <span className="contact-link-icon">
                    <Languages size={16} strokeWidth={2} />
                  </span>
                  <span className="contact-mini-label">Languages</span>
                </div>
                <div className="language-tags">
                  {languages.map((lang, i) => (
                    <span className="language-tag" key={i}>
                      <span className="lang-text">{lang}</span>
                    </span>
                  ))}
                </div>
              </div>

             <div className="telemetry-block">
  <div className="telemetry-header">
    <span className="contact-mini-label terminal-label">System Status</span>
    <span className="telemetry-badge">LIVE</span>
  </div>

  <div className="telemetry-grid">
    <div className="telemetry-item">
      <span className="telemetry-key">Timezone</span>
      <LiveClock />
    </div>
    <div className="telemetry-item">
      <span className="telemetry-key">Deployment</span>
      <span className="telemetry-value">Lebanon — Open to Relocation</span>
    </div>
    <div className="telemetry-item">
      <span className="telemetry-key">Status</span>
      <span className="telemetry-value status-active">
        <span className="pulse-dot"></span>
        Active / Reviewing Roles
      </span>
    </div>
  </div>

  <div className="current-operations">
    <span className="telemetry-key telemetry-focus-label">Current Focus</span>
    <p className="operations-text">
      Developing dynamic, multi-step frontend architectures while continuing research into advanced
      6G communication frameworks and RF system optimizations.
    </p>
  </div>
</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default Contact;