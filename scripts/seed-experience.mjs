// One-off migration: seeds the existing hardcoded Experience content into
// Supabase. Not imported by the app — safe to leave in the repo.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seed-experience.mjs

import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Missing env vars. Required: SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const experience = [
  {
    company: "The Digital Hub",
    role: "Full Stack Engineer (Internship)",
    location: "Beirut Governorate, Lebanon · Hybrid",
    period: "May 2026 – Present",
    highlights: [
      "Developing full-stack web applications with a focus on JavaScript and modern front-end/back-end integration.",
      "Collaborating within a hybrid engineering team on feature development, code review, and iterative delivery.",
    ],
    sort_order: 10,
  },
  {
    company: "Khateeb Home Appliances",
    role: "IT Systems & Technical Support Engineer",
    location: "Beirut, Lebanon",
    period: "Dec 2025 – May 2026",
    highlights: [
      "Administered internal IT networks and Point-of-Sale systems, ensuring high availability and zero downtime for daily commercial transactions.",
      "Optimized inventory management databases, improving data accuracy and retrieval speeds for the sales team.",
      "Provided advanced technical troubleshooting for hardware and software issues, resolving operational bottlenecks.",
    ],
    sort_order: 20,
  },
  {
    company: "UNRWA (German Cooperation / KfW)",
    role: "Project Field Assistant — Cash-for-Work Program",
    location: "Siblin Training Centre, Lebanon",
    period: "Mar 2026 – Apr 2026",
    highlights: [
      "Coordinated daily field activities, ensuring project goals met UNRWA and KfW standards.",
      "Independently managed a demanding night-shift schedule, maintaining operations under minimal supervision.",
      "Maintained project documentation — attendance sheets, progress reports, and field logs — for senior field supervisors.",
    ],
    sort_order: 30,
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

  const { error, data } = await supabase.from("experience").insert(experience).select();
  if (error) {
    console.error("Experience insert failed:", error.message);
    process.exit(1);
  }
  console.log(`Inserted ${data.length} experience entries.`);
}

main();
