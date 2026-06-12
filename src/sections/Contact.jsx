import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  UserRound,
  Link,
  MapPin,
  Briefcase,
  Languages,
} from "lucide-react";
import SignalBackground from "../components/SignalBackground";

const languages = ["Arabic", "English", "Swedish", "French (Basic)"];

const primaryContacts = [
  {
    label: "Email",
    value: "mohammaddeeb147@gmail.com",
    href: "mailto:mohammaddeeb147@gmail.com",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "+961 79 067 170",
    href: "tel:+96179067170",
    icon: Phone,
  },
];

const profileLinks = [
  {
    label: "LinkedIn",
    value: "mohamad-dib-b51286271",
    href: "https://www.linkedin.com/in/mohamad-dib-b51286271",
    icon: UserRound,
  },
  {
    label: "GitHub",
    value: "github.com/mohamaddib147",
    href: "https://github.com/mohamaddib147",
    icon: Link,
  },
];

const snapshotItems = [
  {
    label: "Location",
    value: "Saida / Beirut, Lebanon",
    icon: MapPin,
  },
  {
    label: "Availability",
    value: "Open to relocation and engineering-focused opportunities.",
    icon: Briefcase,
  },
];

function Contact() {
  return (
    <section id="contact" className="portfolio-data-section contact-section">
      {/* Endpoint handshake — two arms reaching toward each other and linking */}
      <SignalBackground variant="contact" className="signal-contact" />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker">Contact</p>
        <h2>Open to engineering, software, and infrastructure-focused opportunities.</h2>
        <p className="section-intro">
          Based in Lebanon and open to relocation, with interest in roles across
          software development, networking, communication systems, technical support,
          and security-oriented engineering environments.
        </p>

        <div className="contact-grid refined-contact-grid upgraded-contact-grid">
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
                For opportunities, collaboration, or technical roles, these are the
                fastest ways to reach me directly.
              </p>
            </div>

            <div className="contact-link-list contact-link-list-primary">
              {primaryContacts.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.href}
                    className="contact-link-card contact-link-card-primary"
                  >
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
                {profileLinks.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={index}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link-card"
                    >
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
            </div>
          </motion.div>

          <motion.div
            className="contact-card contact-side-card contact-side-card-light"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <h3>Profile Snapshot</h3>

            <div className="contact-snapshot-list">
              {snapshotItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div className="contact-snapshot-item" key={index}>
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
              <p>
                Software development, communication systems, networking,
                security, IoT, technical support, and infrastructure.
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
                {languages.map((language, index) => (
                  <span className="language-tag" key={index}>
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default Contact;
