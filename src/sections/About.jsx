import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import SignalBackground from "../components/SignalBackground";

// ── Animation variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut", delay: i * 0.15 },
  }),
};

const tagVariants = {
  hidden: { opacity: 0, scale: 0.82 },
  show: (j) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut", delay: j * 0.05 },
  }),
};

// ── Data ─────────────────────────────────────────────────────────────────

const education = [
 
  {
    flagCode: "se",
    country: "Sweden",
    school: "KTH Royal Institute of Technology, Stockholm",
    degree: "Master of Science in Communication Systems",
    specialization: "Wireless Networking Track",
    period: "Aug 2022 – Jan 2025",
    highlight: "Highest grade (A) in Communication Systems Design · Internet Security and Privacy",
  },
   {
    flagCode: "lb",
    country: "Lebanon",
    school: "Lebanese International University",
    degree: "Bachelor of Science in Communication Engineering",
    period: "Sep 2018 – Jul 2021",
    highlight: "Top grades in Advanced Digital Logic, Linux Lab & Analog Communication",
  },
];

const skillGroups = [
  {
    category: "Wireless & Networks",
    description: "Networked systems, radio fundamentals, and communication infrastructure.",
    skills: ["5G NR", "LTE", "MIMO", "Beamforming", "TCP/IP", "VPN", "RF Planning"],
  },
  {
    category: "Security",
    description: "Security-focused analysis, resilient architecture, and system protection.",
    skills: ["Network Security", "Secure System Design", "Ethical Hacking", "Vulnerability Assessment"],
  },
  {
    category: "Programming",
    description: "Engineering-oriented programming across scripting, systems, and analysis tools.",
    skills: ["Python", "MATLAB", "C/C++", "Java", "Bash", "SQL"],
  },
  {
    category: "Full-Stack Development",
    description: "End-to-end web development, from responsive UI to backend and database integration.",
    skills: ["React", "Next.js", "Node.js", "TypeScript", "MongoDB", "Stripe API", "Responsive Design"],
  },
];

// ── Stat counter hook ─────────────────────────────────────────────────────

function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = null;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}

// ── Flag image ────────────────────────────────────────────────────────────

function FlagImg({ code, label }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={28}
      height={20}
      alt={`${label} flag`}
      loading="lazy"
      style={{
        borderRadius: 3,
        objectFit: "cover",
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        flexShrink: 0,
      }}
    />
  );
}

// ── Profile stats ─────────────────────────────────────────────────────────

function StatCounter({ target, label, suffix = "+" }) {
  const { count, ref } = useCounter(target);

  return (
    <div ref={ref} className="about-stat">
      <span className="about-stat-number">
        {count}
        {suffix}
      </span>
      <span className="about-stat-label">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" className="about-section">
      <SignalBackground variant="about" className="signal-about" />

      <motion.div
        className="about-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div className="about-header" variants={itemVariants}>
          <p className="section-kicker">About Me</p>
          <h2>Engineering mindset</h2>
        </motion.div>

        <motion.div
          className="about-summary-card"
          variants={itemVariants}
          whileHover={{
            y: -4,
            boxShadow: "0 18px 42px rgba(0,0,0,0.18)",
            transition: { duration: 0.22 },
          }}
        >
          <div className="about-summary-top">
            <div>
              <p className="about-summary-label">Profile</p>
              <h3 className="about-summary-heading">Bridging engineering systems and full-stack execution</h3>
            </div>

            
          </div>

          <p className="about-summary-text">
            Master&apos;s graduate in Communication Systems (Wireless Networking) from KTH,
            with a strong foundation in electrical engineering and computer science principles.
            Currently working as a Full-Stack Engineer, building production web applications
            with React, Next.js, and MongoDB, backed by a deep technical foundation in
            wireless networks, network security, and systems programming.
          </p>

          <div className="about-stats-grid">
            <StatCounter target={2} label="Degrees" suffix="" />
            <StatCounter target={7} label="Projects Shipped" suffix="" />
            <StatCounter target={3} label="Professional Roles" suffix="" />
          </div>
        </motion.div>

        <motion.div className="about-education" variants={itemVariants}>
          <h3 className="about-sub-heading">Education</h3>

          <div className="education-timeline">
            {education.map((edu, i) => (
              <motion.div
                className="education-item"
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{
                  y: -4,
                  boxShadow: "0 12px 32px rgba(56,189,248,0.12)",
                  transition: { duration: 0.22 },
                }}
              >
                <div className="edu-timeline-col">
                  <motion.div
                    className="edu-dot"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.2, type: "spring", stiffness: 300 }}
                  >
                    <GraduationCap size={10} strokeWidth={2.2} />
                  </motion.div>

                  {i < education.length - 1 && (
                    <motion.div
                      className="edu-line"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.35, duration: 0.5, ease: "easeOut" }}
                      style={{ transformOrigin: "top" }}
                    />
                  )}
                </div>

                <div className="edu-content-card">
                  <div className="edu-header">
                    <FlagImg code={edu.flagCode} label={edu.country} />
                    <div>
                      <p className="edu-school">{edu.school}</p>
                      <p className="edu-country-label">{edu.country}</p>
                    </div>
                    <span className="edu-period">{edu.period}</span>
                  </div>

                  <p className="edu-degree">{edu.degree}</p>

                  {edu.specialization && (
                    <p className="edu-spec">Specialization: {edu.specialization}</p>
                  )}

                  <motion.p
                    className="edu-highlight"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.45, duration: 0.4 }}
                  >
                    ✦ {edu.highlight}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="about-skills" variants={itemVariants}>
          <h3 className="about-sub-heading">Technical Skills</h3>

          <div className="skills-group-grid">
            {skillGroups.map((group, i) => (
              <motion.div
                className="skill-group-card"
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2 },
                }}
              >
                <p className="skill-group-label">{group.category}</p>
                <p className="skill-group-description">{group.description}</p>

                <div className="skill-tags">
                  {group.skills.map((skill, j) => (
                    <motion.span
                      className="skill-tag"
                      key={j}
                      custom={j}
                      variants={tagVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 10px rgba(56,189,248,0.24)",
                        transition: { duration: 0.15 },
                      }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default About;