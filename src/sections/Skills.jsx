import { motion } from "framer-motion";
import SignalBackground from "../components/SignalBackground";

const skillGroups = [
  {
    title: "Wireless & Networking",
    items: [
      "5G NR",
      "LTE",
      "3GPP Standards",
      "Beamforming",
      "MIMO",
      "RF Planning",
      "Spectrum Analysis",
      "Wireless Performance Optimization",
      "Robust Network Design",
      "TCP/IP",
      "DNS",
      "VPN",
      "Routing Protocols",
      "Network Administration",
      "Troubleshooting",
    ],
  },
  {
    title: "Security",
    items: [
      "Network Security",
      "Wireless Network Security",
      "Secure System Design",
      "Ethical Hacking Principles",
      "Vulnerability Assessment",
      "Intrusion Detection / Prevention Concepts",
      "Security Auditing Fundamentals",
      "Data Privacy",
    ],
  },
  {
    title: "Programming & Simulation",
    items: [
      "Python",
      "Network Simulations",
      "Data Analysis",
      "Automation Scripts",
      "MATLAB",
      "Signal Processing",
      "Algorithm Development",
      "C/C++ Basics",
    ],
  },
  {
    title: "Engineering & Analysis",
    items: [
      "Systems Engineering Concepts",
      "Analytical Thinking",
      "Complex Problem-Solving",
      "System Design & Modeling",
      "Technical Analysis",
    ],
  },
  {
    title: "Soft Skills",
    items: [
      "Teamwork & Collaboration",
      "Curiosity & Eagerness to Learn",
      "Adaptability",
      "Communication",
      "Problem-Solving",
    ],
  },
];

function Skills() {
  return (
    <section id="skills" className="portfolio-data-section skills-section">
      <SignalBackground activeIndex={3} className="signal-skills" />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker">Skills</p>
        <h2>Technical depth backed by systems thinking.</h2>
        <p className="section-intro">
          My skill set combines wireless systems, security awareness, software
          tooling, and analytical problem-solving.
        </p>

        <div className="skill-section-grid">
          {skillGroups.map((group, index) => (
            <div className="skill-section-card" key={index}>
              <h3>{group.title}</h3>
              <div className="skill-section-tags">
                {group.items.map((item, itemIndex) => (
                  <span className="skill-section-tag" key={itemIndex}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default Skills;