import { motion } from "framer-motion";
import SignalBackground from "../components/SignalBackground";

const technologies = [
  "Python",
  "MATLAB",
  "C/C++",
  "Java",
  "React",
  "JavaScript",
  "HTML",
  "CSS",
  "Git",
  "GitHub",
  "TCP/IP",
  "DNS",
  "VPN",
  "Linux",
];

function Technologies() {
  return (
    <section
      id="technologies"
      className="portfolio-data-section technologies-section"
    >
      <SignalBackground activeIndex={2} className="signal-tech" />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker">Technologies & Tools</p>
        <h2>Core tools behind my engineering and development work.</h2>
        <p className="section-intro">
          A multidisciplinary stack spanning software development, simulation,
          networking, and technical workflow tools.
        </p>

        <div className="tech-grid">
          {technologies.map((tech, index) => (
            <div className="tech-card" key={index}>
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default Technologies;