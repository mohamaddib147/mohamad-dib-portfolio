import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SignalBackground from "../components/SignalBackground";
import { supabase } from "../lib/supabaseClient";

// Shown until the Supabase fetch resolves, and kept as a fallback if it fails
// or the table is empty — the section should never render blank.
const FALLBACK_SKILL_GROUPS = [
  {
    title: "Wireless & RF Engineering",
    items: [
      "5G NR", "LTE", "3GPP Standards", "MIMO", "Beamforming", "RF Planning & Analysis",
      "Spectrum Analysis", "Over-the-Air Computation", "Physical-Layer Security",
      "Signal Processing (MATLAB)", "Link Budget & Channel Modeling",
    ],
  },
  {
    title: "Networking & Security",
    items: [
      "TCP/IP", "OSPF / BGP", "VPNs (IPsec)", "Cisco", "Fortinet", "Zero Trust", "PKI",
      "VANET Security", "Wireshark", "Secure Code Review", "Vulnerability Assessment",
    ],
  },
  {
    title: "Programming & Simulation",
    items: [
      "Python", "MATLAB", "C/C++", "Network & RF Simulations", "Data Analysis",
      "Automation Scripts", "Arduino / Embedded",
    ],
  },
  {
    title: "Full-Stack Development",
    items: [
      "React", "Next.js", "TypeScript", "Node.js / Express", "FastAPI", "Django",
      "PostgreSQL / Supabase", "MongoDB", "JWT & RBAC", "REST APIs", "CI/CD", "Git",
    ],
  },
  {
    title: "AI & Tooling",
    items: ["LLM / RAG Integration", "Prompt Engineering", "Jest / Vitest", "Jira", "Cloud Deployment"],
  },
];

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
        <h2>Technical depth backed by systems thinking.</h2>
        <p className="section-intro">
          My skill set combines wireless systems, security awareness, software
          tooling, and analytical problem-solving.
        </p>

        <div className="skill-section-grid">
          {skillGroups.map((group, index) => (
            <div className="skill-section-card" key={group.id ?? index}>
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
