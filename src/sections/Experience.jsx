import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import SignalBackground from "../components/SignalBackground";

// ── Data ─────────────────────────────────────────────────────────────────

const experience = [
  {
    company: "The Digital Hub",
    role: "Full Stack Engineer (Internship)",
    location: "Beirut Governorate, Lebanon · Hybrid",
    period: "May 2026 – Present",
    highlights: [
      "Developing full-stack web applications with a focus on JavaScript and modern front-end/back-end integration.",
      "Collaborating within a hybrid engineering team on feature development, code review, and iterative delivery.",
    ],
  },
  {
    company: "Khateeb Home Appliances",
    role: "IT Systems & Technical Support Engineer",
    location: "Beirut, Lebanon",
    period: "Dec 2025 – May 2026",
    highlights: [
      "Administered internal IT networks and Point-of-Sale systems, ensuring high availability and zero downtime for daily commercial transactions.",
      "Optimized inventory management databases, improving data accuracy and retrieval speeds for the sales team.",
      "Provided advanced technical troubleshooting for hardware and software issues, resolving operational bottlenecks.",
    ],
  },
  {
    company: "UNRWA (German Cooperation / KfW)",
    role: "Project Field Assistant — Cash-for-Work Program",
    location: "Siblin Training Centre, Lebanon",
    period: "Mar 2026 – Apr 2026",
    highlights: [
      "Coordinated daily field activities, ensuring project goals met UNRWA and KfW standards.",
      "Independently managed a demanding night-shift schedule, maintaining operations under minimal supervision.",
      "Maintained project documentation — attendance sheets, progress reports, and field logs — for senior field supervisors.",
    ],
  },
];

// ── Section ──────────────────────────────────────────────────────────────

function Experience() {
  return (
    <section id="experience" className="portfolio-data-section experience-section">
      <SignalBackground variant="about" className="signal-experience" />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker">Experience</p>
        <h2>Hands-on engineering across full-stack development, IT systems, and field operations.</h2>
        <p className="section-intro">
          A track record of operating in demanding, real-world environments — from
          collaborative full-stack development to mission-critical IT infrastructure.
        </p>

        <div className="education-timeline">
          {experience.map((job, i) => (
            <motion.div
              className="education-item"
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.12 }}
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
                  transition={{ delay: i * 0.12 + 0.15, type: "spring", stiffness: 300 }}
                >
                  <Briefcase size={10} strokeWidth={2.2} />
                </motion.div>

                {i < experience.length - 1 && (
                  <motion.div
                    className="edu-line"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.3, duration: 0.5, ease: "easeOut" }}
                    style={{ transformOrigin: "top" }}
                  />
                )}
              </div>

              <div className="edu-content-card">
                <div className="edu-header" style={{ gridTemplateColumns: "1fr auto" }}>
                  <div>
                    <p className="edu-school">{job.company}</p>
                    <p className="edu-country-label">{job.location}</p>
                  </div>
                  <span className="edu-period">{job.period}</span>
                </div>

                <p className="edu-degree">{job.role}</p>

                <div className="project-highlight-block" style={{ marginTop: 10 }}>
                  {job.highlights.map((highlight, hIndex) => (
                    <div className="project-highlight-item" key={hIndex}>
                      <span className="project-highlight-dot" />
                      <p>{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default Experience;
