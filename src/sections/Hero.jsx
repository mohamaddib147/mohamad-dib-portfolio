import { motion } from "framer-motion";
import { ArrowRight, Mail, Wifi, Shield, Cpu, MapPin } from "lucide-react";
import SignalBackground from "../components/SignalBackground";

const contentContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.15,
    },
  },
};

const contentItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

function Hero() {
  return (
    <section id="hero" className="hero-section">
      <SignalBackground variant="hero" className="signal-hero" />

      <div className="hero-container">
        <motion.div
          className="hero-content"
          variants={contentContainer}
          initial="hidden"
          animate="show"
        >
          <motion.span className="hero-badge" variants={contentItem}>
            Communication Engineer → Wireless Networking
          </motion.span>

          <motion.h1 className="hero-title" variants={contentItem}>
            Mohamad Dib
          </motion.h1>

          <motion.h2 className="hero-subtitle" variants={contentItem}>
            Frontend Developer & Communication Engineer
          </motion.h2>

          <motion.p className="hero-description" variants={contentItem}>
            I build clean, responsive web interfaces and bring a strong engineering
            background in software, networking, wireless communication, and technical problem-solving.
          </motion.p>

          <motion.div className="hero-actions" variants={contentItem}>
            <a href="#projects" className="btn btn-primary">
              View Projects
              <ArrowRight size={18} />
            </a>

            <a href="#contact" className="btn btn-secondary">
              Contact Me
              <Mail size={18} />
            </a>
          </motion.div>

          <motion.nav
            className="hero-quick-links"
            variants={contentItem}
            aria-label="Quick section navigation"
          >
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </motion.nav>
        </motion.div>

        <motion.aside
          className="hero-card"
          initial={{ opacity: 0, x: 40, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: "easeOut" }}
        >
          <p className="card-label">Profile Snapshot</p>

          <div className="info-item">
            <Wifi size={18} />
            <div>
              <h3>Focus</h3>
              <p>Frontend, Networks, Wireless Systems</p>
            </div>
          </div>

          <div className="info-item">
            <Shield size={18} />
            <div>
              <h3>Strength</h3>
              <p>Security, Reliability, Problem Solving</p>
            </div>
          </div>

          <div className="info-item">
            <Cpu size={18} />
            <div>
              <h3>Background</h3>
              <p>Communication Systems, Software, Embedded</p>
            </div>
          </div>

          <div className="info-item info-item-last">
            <MapPin size={18} />
            <div>
              <h3>Location</h3>
              <p>Beirut / Sidon, Lebanon · Open to relocation</p>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

export default Hero;