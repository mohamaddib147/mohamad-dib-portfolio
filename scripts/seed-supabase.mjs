// One-off migration: seeds the existing hardcoded Projects/Skills content into
// Supabase so the site has real data to show as soon as it switches to fetching
// from the database. Not imported by the app — safe to leave in the repo.
//
// Usage (from the repo root):
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seed-supabase.mjs
//
// Signs in as the admin user (rather than using a service-role key) so the
// insert goes through the same RLS write policy the admin panel uses.

import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Missing env vars. Required: SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const projects = [
  {
    title: "Event Ticket Platform",
    meta: "Full-Stack Web Application · 2026",
    role: "Full-Stack Developer",
    badge: "Featured · Full-Stack",
    accent: "accent-software",
    layout: "layout-software",
    project_type: "software",
    category: "fullstack",
    icon_name: "Ticket",
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
    sort_order: 10,
  },
  {
    title: "RestoManager",
    meta: "Full-Stack Web Application · 2026",
    role: "Full-Stack Developer",
    badge: "Featured · Full-Stack",
    accent: "accent-software",
    layout: "layout-software",
    project_type: "software",
    category: "fullstack",
    icon_name: "UtensilsCrossed",
    link: "https://github.com/mohamaddib147/resto-manager",
    summary:
      "A full-stack restaurant discovery, menu management, approval, and ordering platform with role-based access for customers, restaurant owners, and administrators.",
    description:
      "Built as a monorepo with React 19, TypeScript, and Tailwind CSS on the frontend and Express 5 with MongoDB on the backend. Customers browse approved restaurants and menus, manage a persistent cart, and check out; owners register restaurants, submit verification documents, and manage menus and orders from an operational dashboard.",
    highlights: [
      "Designed role-based access control for customers, restaurant owners, and administrators using Better Auth.",
      "Built an owner dashboard for menu, category, and order management backed by Zod-validated shared schemas.",
      "Integrated Supabase for restaurant media and verification-document storage alongside MongoDB data models.",
    ],
    tech: ["React", "TypeScript", "Express", "MongoDB", "Better Auth", "Tailwind CSS"],
    sort_order: 20,
  },
  {
    title: "Enhancing Security in Over-the-Air Computation",
    meta: "KTH Royal Institute of Technology · Aug 2022 – Feb 2024",
    role: "Graduate Researcher",
    badge: "Master's Thesis",
    accent: "accent-research",
    layout: "layout-research",
    project_type: "thesis",
    category: "engineering",
    icon_name: "Radio",
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
    sort_order: 30,
  },
  {
    title: "Vehicular Communication Security",
    meta: "Systems Architecture Project · 2023 – 2024",
    role: "Security Engineer",
    badge: "VANET Security",
    accent: "accent-security",
    layout: "layout-security",
    project_type: "networking",
    category: "engineering",
    icon_name: "Shield",
    link: null,
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
    sort_order: 40,
  },
  {
    title: "IoT Air Quality System",
    meta: "C/C++ & Python Project · 2023",
    role: "IoT & Firmware Developer",
    badge: "IoT Monitoring",
    accent: "accent-iot",
    layout: "layout-iot",
    project_type: "iot",
    category: "engineering",
    icon_name: "Cpu",
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
    sort_order: 50,
  },
  {
    title: "Network Protocol Development",
    meta: "C++ / TCP Project · 2022 – 2023",
    role: "Protocol Developer",
    badge: "Low-Level Networking",
    accent: "accent-systems",
    layout: "layout-systems",
    project_type: "networking",
    category: "engineering",
    icon_name: "Network",
    link: null,
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
    sort_order: 60,
  },
  {
    title: "Secure Enterprise Network Architecture",
    meta: "Cisco & Fortinet Deployment · 2023",
    role: "Network Security Architect",
    badge: "Enterprise Infrastructure",
    accent: "accent-enterprise",
    layout: "layout-enterprise",
    project_type: "networking",
    category: "engineering",
    icon_name: "Building2",
    link: null,
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
    sort_order: 70,
  },
  {
    title: "Clinical Management Application",
    meta: "Java & Database Project · 2021",
    role: "Full-Stack Developer",
    badge: "Application Development",
    accent: "accent-software",
    layout: "layout-software",
    project_type: "software",
    category: "fullstack",
    icon_name: "HeartPulse",
    link: null,
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
    sort_order: 80,
  },
];

const skillGroups = [
  {
    title: "Wireless & Networking",
    items: [
      "5G NR", "LTE", "3GPP Standards", "Beamforming", "MIMO", "RF Planning",
      "Spectrum Analysis", "Wireless Performance Optimization", "Robust Network Design",
      "TCP/IP", "DNS", "VPN", "Routing Protocols", "Network Administration", "Troubleshooting",
    ],
    sort_order: 10,
  },
  {
    title: "Security",
    items: [
      "Network Security", "Wireless Network Security", "Secure System Design",
      "Ethical Hacking Principles", "Vulnerability Assessment",
      "Intrusion Detection / Prevention Concepts", "Security Auditing Fundamentals", "Data Privacy",
    ],
    sort_order: 20,
  },
  {
    title: "Programming & Simulation",
    items: [
      "Python", "Network Simulations", "Data Analysis", "Automation Scripts",
      "MATLAB", "Signal Processing", "Algorithm Development", "C/C++ Basics",
    ],
    sort_order: 30,
  },
  {
    title: "Engineering & Analysis",
    items: [
      "Systems Engineering Concepts", "Analytical Thinking",
      "Complex Problem-Solving", "System Design & Modeling", "Technical Analysis",
    ],
    sort_order: 40,
  },
  {
    title: "Soft Skills",
    items: [
      "Teamwork & Collaboration", "Curiosity & Eagerness to Learn",
      "Adaptability", "Communication", "Problem-Solving",
    ],
    sort_order: 50,
  },
];

async function main() {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (signInError) {
    console.error("Sign-in failed:", signInError.message);
    process.exit(1);
  }

  const { error: projectsError, data: projectsData } = await supabase
    .from("projects")
    .insert(projects)
    .select();
  if (projectsError) {
    console.error("Projects insert failed:", projectsError.message);
  } else {
    console.log(`Inserted ${projectsData.length} projects.`);
  }

  const { error: skillsError, data: skillsData } = await supabase
    .from("skill_groups")
    .insert(skillGroups)
    .select();
  if (skillsError) {
    console.error("Skill groups insert failed:", skillsError.message);
  } else {
    console.log(`Inserted ${skillsData.length} skill groups.`);
  }
}

main();
