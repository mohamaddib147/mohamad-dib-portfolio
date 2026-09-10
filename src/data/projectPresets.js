import {
  Shield,
  Radio,
  Cpu,
  Network,
  Building2,
  HeartPulse,
  Ticket,
  UtensilsCrossed,
  Film,
} from "lucide-react";

// "Visual Style" is a form-only convenience — it fans out to real accent/layout/
// projectType columns on submit so the DB schema never needs to change if a new
// combo shows up later.
export const STYLE_PRESETS = {
  software: {
    label: "Software / Full-Stack",
    accent: "accent-software",
    layout: "layout-software",
    projectType: "software",
  },
  research: {
    label: "Research / Thesis",
    accent: "accent-research",
    layout: "layout-research",
    projectType: "thesis",
  },
  security: {
    label: "Security",
    accent: "accent-security",
    layout: "layout-security",
    projectType: "networking",
  },
  iot: {
    label: "IoT",
    accent: "accent-iot",
    layout: "layout-iot",
    projectType: "iot",
  },
  systems: {
    label: "Systems / Networking",
    accent: "accent-systems",
    layout: "layout-systems",
    projectType: "networking",
  },
  enterprise: {
    label: "Enterprise",
    accent: "accent-enterprise",
    layout: "layout-enterprise",
    projectType: "networking",
  },
};

export const ICON_MAP = {
  Shield,
  Radio,
  Cpu,
  Network,
  Building2,
  HeartPulse,
  Ticket,
  UtensilsCrossed,
  Film,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export const CATEGORY_OPTIONS = [
  { value: "fullstack", label: "Full Stack" },
  { value: "engineering", label: "Engineering" },
];

// Reverse-lookup: given real accent/layout/projectType columns from the DB,
// find which preset key they match (used to preselect the dropdown when editing).
export function findStyleKey({ accent, layout, projectType }) {
  return (
    Object.keys(STYLE_PRESETS).find((key) => {
      const preset = STYLE_PRESETS[key];
      return (
        preset.accent === accent &&
        preset.layout === layout &&
        preset.projectType === projectType
      );
    }) ?? "software"
  );
}
