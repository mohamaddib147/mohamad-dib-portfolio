# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # eslint .
```

There is no test suite configured. Verify changes with `npm run build` (catches JSX/import errors) and `npm run lint`, and by actually loading the dev server for anything visual/interactive.

## Deployment

Static site, no backend server. `.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main` (also triggerable via `workflow_dispatch`). `vite.config.js` sets `base: '/mohamad-dib-portfolio/'` for GitHub Pages' subpath hosting — any hardcoded root-absolute asset path (e.g. `/file.pdf`) will 404 in production. Use `import.meta.env.BASE_URL` (or the pattern already used for the favicon in `index.html`) instead.

The build step injects two secrets as Vite env vars for the Supabase-backed content (see below):
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```
For local development against real data, create `.env.local` (gitignored) with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## Architecture

One-page React 19 + Vite portfolio. `src/main.jsx` → `App.jsx` → `pages/Home.jsx`, which assembles `sections/*.jsx` in order (Hero, About, Experience, Technologies, Skills, Projects, OacSimulator, HireMe, Contact), each separated by a `<SectionDivider variant="…">`. `App.jsx` also does simple hash-based routing: `window.location.hash === '#studio'` renders `pages/Admin.jsx` instead of the public site — there is no router library, just this one hash check.

### Content: hardcoded vs. Supabase-backed

Most sections (About, Experience, Technologies, HireMe) still hold their content as hardcoded arrays directly in the section file. **Projects and Skills are the exception** — they fetch from Supabase at runtime (`src/lib/supabaseClient.js`) and fall back to a hardcoded `FALLBACK_PROJECTS` / `FALLBACK_SKILL_GROUPS` array in the same file if the fetch fails, the table is empty, or Supabase isn't configured (`supabase` export is `null` when env vars are missing — always check for that before using the client, don't let it throw at import time). This fallback pattern is intentional: these sections must never render blank.

`src/data/projectPresets.js` is the shared source of truth between `Projects.jsx` and `Admin.jsx` for the project card's visual identity: `STYLE_PRESETS` bundles `accent`/`layout`/`projectType` CSS-class combinations behind one friendly key (`software`, `research`, `security`, `iot`, `systems`, `enterprise`) so the admin form exposes one "Visual Style" dropdown instead of three raw fields, and `ICON_MAP` resolves a DB-stored icon name string to the actual `lucide-react` component. The DB itself stores `accent`/`layout`/`project_type`/`icon_name` as plain columns — the preset bundling is a form-UX convenience only, not a schema constraint.

`project.projectType` (one of exactly `"thesis" | "networking" | "iot" | "software"`, enforced by `SignalBackground.jsx`) drives that project's animated canvas motif; `project.category` (`"fullstack" | "engineering"`) drives the Projects section's filter tabs — these are independent axes, don't conflate them.

### Admin panel (`src/pages/Admin.jsx`)

Reachable only at `#studio` (not linked anywhere in the UI). Gated by real Supabase Auth (email/password, session checked via `supabase.auth.getSession()`/`onAuthStateChange`) — the hidden URL is obscurity against casual discovery, not the security boundary; Postgres RLS policies (write access scoped to one specific admin `auth.uid()`, public read via `anon`) are the actual gate. CRUD forms use plain textareas with one-entry-per-line for array fields (`highlights`, `tech`, skill `items`) rather than asking the non-technical admin to hand-write JSON/arrays.

`scripts/seed-supabase.mjs` is a one-off migration script (not imported by the app) that signs in as the admin user and inserts the original hardcoded content into Supabase — useful reference for the exact table schema if it needs to change.

### Visual system

Dark navy + cyan design system in `src/styles/main.css` (single ~4700-line file — no CSS modules/styled-components) plus `src/styles/contact-responsive.css`. Every section renders an animated `SignalBackground` (canvas, per-section `variant` + optional `projectType`) meant to look like wireless/RF motifs (carrier waves, spectrum fields, routing grids) — this is the site's whole visual identity, not decorative filler, so keep new sections consistent with it rather than introducing a different visual language. `SignalScrollMeter.jsx` is the persistent floating RF-readout widget (RSSI/SNR/latency/etc. dividers) shown across the whole page, separate from the per-section dividers (`SectionDivider.jsx` / `DividerReadout.jsx`) that sit between sections.

Terminal/RF-flavored copy is a deliberate running motif (e.g. Contact section's "ESTABLISH LINK" / SYN-ACK language, Admin's "OPERATOR CONSOLE") — match it when adding UI copy in this vein rather than defaulting to generic SaaS copy.
