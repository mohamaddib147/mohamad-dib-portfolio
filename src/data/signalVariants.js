// signalVariants.js
// New structured signal system inspired by the reference screenshot.
// The path uses repeated high peaks and low valleys to make section positions obvious.
// Each section activates one peak dot.

const basePrimaryPath =
  "M0,140 L90,140 C120,140 140,360 190,360 C240,360 260,80 320,80 C380,80 400,360 460,360 C520,360 540,80 600,80 C660,80 680,360 740,360 C800,360 820,80 880,80 C940,80 960,360 1020,360 C1080,360 1100,80 1160,80 L1200,80";

const baseSecondaryPath =
  "M0,155 L90,155 C120,155 140,372 190,372 C240,372 260,98 320,98 C380,98 400,372 460,372 C520,372 540,98 600,98 C660,98 680,372 740,372 C800,372 820,98 880,98 C940,98 960,372 1020,372 C1080,372 1100,98 1160,98 L1200,98";

const sectionNodes = [
  { cx: 90, cy: 140 },
  { cx: 320, cy: 80 },
  { cx: 600, cy: 80 },
  { cx: 880, cy: 80 },
  { cx: 1160, cy: 80 },
  { cx: 1020, cy: 360 },
  { cx: 740, cy: 360 },
];

function buildNodes(activeIndex) {
  return sectionNodes.map((node, index) => ({
    ...node,
    type: index === activeIndex ? "active" : "dim",
  }));
}

export const signalVariants = {
  hero: {
    className: "signal-variant-hero",
    primaryPath: basePrimaryPath,
    secondaryPath: baseSecondaryPath,
    nodes: buildNodes(0),
  },

  about: {
    className: "signal-variant-about",
    primaryPath: basePrimaryPath,
    secondaryPath: baseSecondaryPath,
    nodes: buildNodes(1),
  },

  technologies: {
    className: "signal-variant-technologies",
    primaryPath: basePrimaryPath,
    secondaryPath: baseSecondaryPath,
    nodes: buildNodes(2),
  },

  skills: {
    className: "signal-variant-skills",
    primaryPath: basePrimaryPath,
    secondaryPath: baseSecondaryPath,
    nodes: buildNodes(3),
  },

  projects: {
    className: "signal-variant-projects",
    primaryPath: basePrimaryPath,
    secondaryPath: baseSecondaryPath,
    nodes: buildNodes(4),
  },

  "hire-me": {
    className: "signal-variant-hire-me",
    primaryPath: basePrimaryPath,
    secondaryPath: baseSecondaryPath,
    nodes: buildNodes(5),
  },

  contact: {
    className: "signal-variant-contact",
    primaryPath: basePrimaryPath,
    secondaryPath: baseSecondaryPath,
    nodes: buildNodes(6),
  },
};