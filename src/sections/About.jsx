// About.jsx
// Professional About section with:
// - Profile summary from resume
// - Visual education timeline with university flags
// - Skills grouped by category
// - Scroll-reveal animation using Framer Motion

import { motion } from "framer-motion";
import SignalBackground from "../components/SignalBackground";

// Staggered container — children appear one after another
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

// Each item fades and rises into view
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

// Education timeline data
const education = [
  {
    flag: "🇱🇧",
    country: "Lebanon",
    school: "Lebanese International University",
    degree: "Bachelor of Science in Communication Engineering",
    period: "Sep 2018 – Jul 2021",
    highlight: "Top grades in Advanced Digital Logic, Linux Lab & Analog Communication",
  },
  {
    flag: "🇸🇪",
    country: "Sweden",
    school: "KTH Royal Institute of Technology, Stockholm",
    degree: "Master of Science in Communication Systems",
    specialization: "Wireless Networking Track",
    period: "Aug 2022 – Jan 2025",
    highlight: "Highest grade (A) in Communication Systems Design · Passed Ethical Hacking",
  },
];

// Skill groups with categories
const skillGroups = [
  {
    category: "Wireless & Networks",
    skills: ["5G NR", "LTE", "MIMO", "Beamforming", "TCP/IP", "VPN", "RF Planning"],
  },
  {
    category: "Security",
    skills: ["Network Security", "Secure System Design", "Ethical Hacking", "Vulnerability Assessment"],
  },
  {
    category: "Programming",
    skills: ["Python", "MATLAB", "C/C++", "Java", "Bash", "SQL"],
  },
  {
    category: "Frontend",
    skills: ["React", "JavaScript", "HTML", "CSS", "Responsive Design"],
  },
];

function About() {
  return (
    <section id="about" className="about-section">
      <SignalBackground activeIndex={1} className="signal-about" />

      <motion.div
        className="about-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Section header */}
        <motion.div className="about-header" variants={itemVariants}>
          <p className="section-kicker">About Me</p>
          <h2>Engineering mindset, frontend direction.</h2>
        </motion.div>

        {/* Profile summary */}
        <motion.div className="about-summary-card" variants={itemVariants}>
          <p className="about-summary-label">Profile</p>
          <p>
            Master's graduate in Communication Systems (Wireless Networking) from KTH, 
            with a strong foundation in Electrical Engineering and Computer Science principles. 
            Experienced in wireless networks, network security, and Python programming. 
            Now growing into frontend development to build clean, responsive, and technically 
            disciplined web interfaces.
          </p>
        </motion.div>

        {/* Education timeline */}
        <motion.div className="about-education" variants={itemVariants}>
          <h3 className="about-sub-heading">Education</h3>

          <div className="education-timeline">
            {education.map((edu, i) => (
              <div className="education-item" key={i}>
                {/* Left: timeline dot and line */}
                <div className="edu-timeline-col">
                  <div className="edu-dot" />
                  {i < education.length - 1 && (
                    <div className="edu-line" />
                  )}
                </div>

                {/* Right: content */}
                <div className="edu-content-card">
                  <div className="edu-header">
                    <span className="edu-flag">{edu.flag}</span>
                    <div>
                      <p className="edu-school">{edu.school}</p>
                      <p className="edu-country-label">{edu.country}</p>
                    </div>
                    <span className="edu-period">{edu.period}</span>
                  </div>

                  <p className="edu-degree">{edu.degree}</p>

                  {edu.specialization && (
                    <p className="edu-spec">
                      Specialization: {edu.specialization}
                    </p>
                  )}

                  <p className="edu-highlight">✦ {edu.highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Skills grid */}
        <motion.div className="about-skills" variants={itemVariants}>
          <h3 className="about-sub-heading">Technical Skills</h3>

          <div className="skills-group-grid">
            {skillGroups.map((group, i) => (
              <div className="skill-group-card" key={i}>
                <p className="skill-group-label">{group.category}</p>
                <div className="skill-tags">
                  {group.skills.map((skill, j) => (
                    <span className="skill-tag" key={j}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default About;