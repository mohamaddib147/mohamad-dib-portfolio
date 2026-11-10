import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SignalBackground from "../components/SignalBackground";
import { supabase } from "../lib/supabaseClient";

// Shown until the Supabase fetch resolves, and kept as a fallback if it fails
// or the table is empty — the section should never render blank.
// Each item is "Name | level" (level 1–5); level drives the RSSI meter.
// `evidence` is the "Applied in" footer: "Label > #anchor · Label · …" — items with
// an anchor render as links to that section, plain items render as text.
const FALLBACK_SKILL_GROUPS = [
  {
    title: "Wireless & RF Engineering",
    evidence: "M.Sc. KTH > #about · Secure OAC thesis > #project-enhancing-security-in-over-the-air-computation · VANET security project > #project-vehicular-communication-security-ik2200-kth",
    items: [
      "5G NR / LTE / 3GPP | 4", "MIMO & Beamforming | 4", "Signal Processing (MATLAB) | 5",
      "Physical-Layer Security | 5", "RF Planning & Analysis | 4", "Spectrum Analysis | 4",
      "Link Budget & Channel Modeling | 4",
    ],
  },
  {
    title: "Networking & Security",
    evidence: "Majlisync code review > #job-majlisync · Enterprise Cisco/Fortinet deployment > #project-secure-enterprise-network-architecture · Khateeb IT systems > #job-khateeb-home-appliances",
    items: [
      "TCP/IP & Routing (OSPF / BGP) | 4", "Cisco & Fortinet | 4", "IPsec VPN & Zero Trust | 4",
      "PKI & Cryptography | 4", "Wireshark & Packet Analysis | 4", "Secure Code Review | 4",
      "Vulnerability Assessment | 3",
    ],
  },
  {
    title: "Software & Full-Stack",
    evidence: "Digital Hub (UNRWA) > #job-the-digital-hub · CarSage > #project-carsage · Future Line Consulting > #experience",
    items: [
      "Python / FastAPI / Django | 5", "React / Next.js / TypeScript | 4", "Node.js / Express | 4",
      "PostgreSQL / Supabase (RLS) | 4", "JWT, RBAC & Secure Sessions | 4", "LLM / RAG Integration | 3",
      "CI/CD & Cloud Deployment | 3",
    ],
  },
  {
    title: "Simulation & IoT Systems",
    evidence: "IoT air-quality system > #project-iot-air-quality-system · Arduino robotics course > #job-bait-atfal-assomoud-niscvt · TCP transmission tool > #project-network-protocol-development",
    items: [
      "MATLAB & Python Simulation | 5", "Arduino & Embedded I/O | 4", "Data Analysis & Automation | 4",
      "C / C++ | 5", "IoT Telemetry | 5",
    ],
  },
];

const LEVEL_LABEL = { 5: "ADVANCED", 4: "PROFICIENT", 3: "WORKING", 2: "FAMILIAR", 1: "BASIC" };

// "Name | 4" → { name, level }; a plain "Name" gets no meter.
function parseItem(raw) {
  const [name, lvl] = String(raw).split("|").map((s) => s.trim());
  const level = Math.min(5, Math.max(1, Number(lvl))) || 0;
  return { name, level };
}

function parseEvidence(text) {
  return String(text).split("·").map((part) => {
    const [label, href] = part.split(">").map((s) => s.trim());
    return { label, href: href?.startsWith("#") ? href : null };
  }).filter((e) => e.label);
}

function Meter({ level }) {
  return (
    <span className="rssi-meter" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.i
          key={n}
          className={n <= level ? "is-on" : ""}
          style={{ height: `${6 + n * 2.5}px` }}
          initial={{ scaleY: 0.2, opacity: 0.3 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: n * 0.06 }}
        />
      ))}
    </span>
  );
}

function Skills() {
  // Starts with the fallback content so the section never renders blank —
  // swaps to live Supabase data silently once the fetch resolves.
  const [skillGroups, setSkillGroups] = useState(FALLBACK_SKILL_GROUPS);

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("skill_groups")
        .select("*")
        .order("sort_order");

      if (cancelled) return;

      if (!error && data && data.length > 0) {
        setSkillGroups(data);
      }
    }

    loadSkills();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="skills" className="portfolio-data-section skills-section">
      {/* Modulation layers — 3 stacked waves + envelope outline */}
      <SignalBackground variant="skills" className="signal-skills" />

      <motion.div
        className="portfolio-section-shell"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="section-kicker">Skills</p>
        <h2>Where the signal is strongest.</h2>
        <p className="section-intro">
          Deepest in wireless and RF, with working breadth across networking,
          security, and the full stack. Levels are self-assessed against the work
          listed under each group.
        </p>

        <p className="skill-legend" aria-hidden="true">
          {[5, 4, 3].map((n) => (
            <span key={n}><Meter level={n} /> {LEVEL_LABEL[n]}</span>
          ))}
        </p>

        <div className="skill-section-grid">
          {skillGroups.map((group, index) => {
            const items = (group.items ?? []).map(parseItem);
            return (
              <div className="skill-section-card" key={group.id ?? index}>
                <h3>{group.title}</h3>
                <ul className="skill-rows">
                  {items.map(({ name, level }) => (
                    <li className="skill-row" key={name}>
                      <span className="skill-row-name">{name}</span>
                      {level > 0 && (
                        <span className="skill-row-level" role="img" aria-label={`${LEVEL_LABEL[level]}, ${level} of 5`}>
                          <Meter level={level} />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                {group.evidence && (
                  <p className="skill-card-evidence">
                    <span>applied in</span>
                    {parseEvidence(group.evidence).map(({ label, href }, i) => (
                      <em key={label}>
                        {i > 0 && " · "}
                        {href ? <a href={href}>{label}</a> : label}
                      </em>
                    ))}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

export default Skills;
