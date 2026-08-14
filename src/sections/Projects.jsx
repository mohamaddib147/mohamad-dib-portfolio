import { motion } from "framer-motion";
import {
  Shield,
  Radio,
  Cpu,
  Network,
  Building2,
  HeartPulse,
  Ticket,
  ArrowUpRight,
} from "lucide-react";
import SignalBackground from "../components/SignalBackground";

// projectType drives the per-card SignalBackground motif inside each card
// `link` is optional — cards without a public repo/demo simply render without
// a clickable footer link instead of pointing somewhere fake.
const projects = [
  {
    title: "Event Ticket Platform",
    meta: "Full-Stack Web Application · 2026",
    role: "Full-Stack Developer",
    badge: "Featured · Full-Stack",
    accent: "accent-software",
    icon: Ticket,
    layout: "layout-software",
    projectType: "software",
    link: "https://github.com/mahmoudaudi/event-ticket",
    summary:
      "A full-stack event ticketing and reservation platform — from event discovery to seat selection, real payments, and an admin dashboard.",
    description:
      "Built with Next.js 16 (App Router), TypeScript, and MongoDB. Implements interactive seat selection, Stripe Checkout for real card payments, QR-code digital e-tickets, and a NextAuth-protected admin dashboard for managing events, bookings, and users.",
    highlights: [
      "Integrated Stripe Checkout with webhook + confirmation-page fulfillment for idempotent, reliable payment processing.",
      "Implemented atomic seat reservation to prevent double-booking under concurrent checkout.",
      "Built a role-gated admin dashboard (NextAuth) separate from the public site's JWT-based user auth.",
    ],
    tech: ["Next.js", "TypeScript", "MongoDB", "Stripe", "NextAuth", "Tailwind CSS"],
  },
  {
    title: "Enhancing Security in Over-the-Air Computation",
    meta: "KTH Royal Institute of Technology · Aug 2022 – Feb 2024",
    role: "Graduate Researcher",
    badge: "Master's Thesis",
    accent: "accent-research",
    icon: Radio,
    layout: "layout-research",
    projectType: "thesis",  // beamforming RF arcs
    link: "https://github.com/mohamaddib147/Secure-Over-the-Air-Computation-using-Zero-Forced-Artificial-Noise",
    summary:
      "A research-driven wireless security project focused on protecting Over-the-Air Computation systems without reducing performance.",
    description:
      "Developed and evaluated a secure OAC framework using uniform input distributions and zero-forced artificial noise, with Python and MATLAB used for signal analysis, RF impairment simulation, and interference-focused evaluation.",
    highlights: [
      "Authored a full master's thesis on secure OAC systems.",
      "Evaluated security improvements without compromising performance.",
      "Worked across wireless communication, signal processing, and interference defense.",
    ],
    tech: ["Python", "MATLAB", "Signal Processing", "Wireless Security", "OAC"],
  },
  {
    title: "Vehicular Communication Security",
    meta: "Systems Architecture Project · 2023 – 2024",
    role: "Security Engineer",
    badge: "VANET Security",
    accent: "accent-security",
    icon: Shield,
    layout: "layout-security",
    projectType: "networking",  // packet route path
    summary:
      "A protocol-security project centered on securing vehicle-to-vehicle and wireless communication environments.",
    description:
      "Engineered frameworks to secure VANET communications with strong focus on authentication, privacy protection, and robust protocol-level defensive measures for wireless data exchange.",
    highlights: [
      "Focused on authentication and privacy in VANET systems.",
      "Applied PKI cryptography to secure wireless communication channels.",
      "Strengthened security thinking at the architecture and protocol layers.",
    ],
    tech: ["VANET", "PKI", "Authentication", "Privacy", "Network Security"],
  },
  {
    title: "IoT Air Quality System",
    meta: "C/C++ & Python Project · 2023",
    role: "IoT & Firmware Developer",
    badge: "IoT Monitoring",
    accent: "accent-iot",
    icon: Cpu,
    layout: "layout-iot",
    projectType: "iot",  // hub-and-spoke node topology
    link: "https://github.com/mohamaddib147/aqiot",
    summary:
      "A practical embedded and telemetry project for real-time environmental monitoring and system validation.",
    description:
      "Built an IoT air quality monitoring solution with cloud-connected analysis, sensor validation, latency measurement, and telemetry review using Python-based analysis workflows.",
    highlights: [
      "Measured sensor accuracy and network latency for reliability.",
      "Connected real-world telemetry to cloud-oriented analysis.",
      "Managed firmware builds and engineering validation workflows.",
    ],
    tech: ["C/C++", "Python", "IoT", "Telemetry", "CMake"],
  },
  {
    title: "Network Protocol Development",
    meta: "C++ / TCP Project · 2022 – 2023",
    role: "Protocol Developer",
    badge: "Low-Level Networking",
    accent: "accent-systems",
    icon: Network,
    layout: "layout-systems",
    projectType: "networking",  // packet route path
    summary:
      "A systems-focused networking project built around reliable and efficient TCP-based communication.",
    description:
      "Created a custom TCP-based transmission tool designed for secure and efficient communication, with low-level socket programming, packet analysis, and throughput-oriented optimization.",
    highlights: [
      "Worked directly with sockets and packet-level behavior.",
      "Focused on throughput improvement and latency reduction.",
      "Strengthened practical implementation of transport-layer concepts.",
    ],
    tech: ["C++", "TCP", "Sockets", "Packet Analysis", "Networking"],
  },
  {
    title: "Secure Enterprise Network Architecture",
    meta: "Cisco & Fortinet Deployment · 2023",
    role: "Network Security Architect",
    badge: "Enterprise Infrastructure",
    accent: "accent-enterprise",
    icon: Building2,
    layout: "layout-enterprise",
    projectType: "networking",  // packet route path
    summary:
      "A network design project focused on secure enterprise connectivity, routing, and firewall-backed resilience.",
    description:
      "Designed and deployed a high-availability enterprise network using advanced routing and switching, while configuring Fortinet firewalls and IPsec VPNs for secure site-to-site communication.",
    highlights: [
      "Worked with OSPF, BGP, and switching design concepts.",
      "Configured firewall and VPN-based secure connectivity.",
      "Focused on resilient infrastructure and secure enterprise traffic flow.",
    ],
    tech: ["Cisco", "Fortinet", "OSPF", "BGP", "IPsec VPN"],
  },
  {
    title: "Clinical Management Application",
    meta: "Java & Database Project · 2021",
    role: "Full-Stack Developer",
    badge: "Application Development",
    accent: "accent-software",
    icon: HeartPulse,
    layout: "layout-software",
    projectType: "software",  // protocol bars / signal trail
    summary:
      "A software application project for managing patient records and administrative workflows in a structured system.",
    description:
      "Engineered a native Android application in Java for handling critical patient records and operational workflows, supported by a relational database design with optimized SQL queries and access control logic.",
    highlights: [
      "Built an Android application for structured record management.",
      "Designed relational database logic for performance and reliability.",
      "Applied access control thinking to sensitive application data.",
    ],
    tech: ["Java", "Android", "MySQL", "SQL", "Application Design"],
  },
];

function Projects() {
  return (
    <section id="projects" className="portfolio-data-section projects-section">
      {/* Section-level background — generic projects variant */}
      <SignalBackground variant="projects" projectType="networking" className="signal-projects" />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker">Projects</p>
        <h2>Engineering work shaped by research, systems, security, and software.</h2>
        <p className="section-intro">
          These projects reflect different sides of my technical background, from
          wireless security and protocol engineering to IoT systems, enterprise
          infrastructure, and application development.
        </p>

        <div className="project-data-grid project-grid-upgraded">
          {projects.map((project, index) => {
            const Icon = project.icon;

            return (
              <motion.article
                key={index}
                className={`project-data-card refined-project-card project-card-unique ${project.accent} ${project.layout}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -6 }}
              >
                {/* Per-card signal motif — replaces the static .project-card-signal div */}
                <div className="project-card-signal">
                  <SignalBackground
                    variant="projects"
                    projectType={project.projectType}
                    className="signal-card"
                  />
                </div>

                <div className="project-top-shell">
                  <div className="project-card-top">
                    <p className="project-meta">{project.meta}</p>
                    <span className="project-type-badge">{project.badge}</span>
                  </div>

                  <div className="project-icon-wrap">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                </div>

                <div className="project-role-line">
                  <span className="project-role-label">Role</span>
                  <span className="project-role-value">{project.role}</span>
                </div>

                <h3>{project.title}</h3>
                <p className="project-summary">{project.summary}</p>
                <p className="project-description">{project.description}</p>

                <div className="project-highlight-block">
                  {project.highlights.map((highlight, highlightIndex) => (
                    <div className="project-highlight-item" key={highlightIndex}>
                      <span className="project-highlight-dot" />
                      <p>{highlight}</p>
                    </div>
                  ))}
                </div>

                <div className="project-card-footer">
                  <div className="project-tag-list">
                    {project.tech.map((tag, tagIndex) => (
                      <span className="project-tag" key={tagIndex}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-arrow-mark"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <ArrowUpRight size={16} strokeWidth={2} />
                    </a>
                  ) : (
                    <span className="project-arrow-mark project-arrow-mark-disabled" aria-hidden="true">
                      <ArrowUpRight size={16} strokeWidth={2} />
                    </span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

export default Projects;
