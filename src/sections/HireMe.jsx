import { motion } from "framer-motion";
import SignalBackground from "../components/SignalBackground";

const hireReasons = [
  "Strong foundation in communication systems, networking, and secure technical design.",
  "Able to combine engineering thinking with clean frontend implementation.",
  "Curious, adaptable, and motivated to keep learning in demanding technical environments.",
  "Comfortable with analytical problem-solving, structured work, and technical collaboration.",
  "Interested in systems engineering, software engineering, and network-oriented technical roles.",
];

function HireMe() {
  return (
    <section id="hire-me" className="portfolio-data-section hire-section">
      {/* Stable flat link — strong horizontal line + traveling pulse */}
      <SignalBackground variant="hire-me" className="signal-hire" />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker">Why Companies Should Hire Me</p>
        <h2>Built for technical environments that value learning and reliability.</h2>
        <p className="section-intro">
          I bring an engineering mindset, multidisciplinary technical exposure,
          and a strong motivation to grow in challenging systems-focused roles.
        </p>

        <div className="hire-list">
          {hireReasons.map((reason, index) => (
            <div className="hire-item" key={index}>
              <span className="hire-bullet" />
              <p>{reason}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default HireMe;
