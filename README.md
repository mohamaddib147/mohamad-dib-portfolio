# Mohamad Dib — Portfolio

**Live portfolio:** [mohamaddib147.github.io/mohamad-dib-portfolio](https://mohamaddib147.github.io/mohamad-dib-portfolio) *(coming soon)*

A personal engineering portfolio built with **React + Vite**, designed around a dark navy interface with a cyan accent and section-specific wireless-inspired backgrounds. Each section carries its own visual motif drawn from wireless systems concepts — carrier waves, routing grids, spectrum fields, modulation layers, and signal trails — while keeping all content clear, readable, and professional.

---

## Project Overview

This portfolio presents Mohamad Dib's background, technical skills, and engineering projects across wireless systems, network security, and software development.

**Site structure:**

| Section | Visual Motif | Purpose |
|---|---|---|
| Hero | Carrier wave + antenna pulse | First impression, name, title, CTA |
| About | Network routing grid | Background, education, engineering story |
| Tools | Spectrum analyzer / RF scan field | Software tools and environments |
| Skills | Layered modulation waves | Technical skills grouped by domain |
| Projects | Per-project wireless motif | Four featured engineering projects |
| Hire Me | Stable low-noise link | Open to work call-to-action |
| Contact | Endpoint connection / signal handoff | Email, LinkedIn, GitHub links |

**Design rules applied across all sections:**
- One dark navy color base (`#0a0e1a`) across the entire site
- One primary accent: cyan / electric blue (`#00d4ff`)
- One typography system — modern sans body, stronger display weight for headings
- One card system — glass cards with subtle border, consistent padding and radius
- Section-specific wireless background at low visual intensity, never competing with content
- No magenta overuse, no excessive glowing effects, content always above the visual noise

---

## Technologies Used

| Technology | Role |
|---|---|
| **React 18** | Component-based UI architecture |
| **Vite** | Development server and build tool |
| **JavaScript (ES6+)** | Application logic and interactivity |
| **CSS (custom)** | Design system, section backgrounds, animations |
| **HTML5 Canvas / SVG** | Wireless-inspired animated backgrounds per section |
| **Framer Motion** | Entrance and scroll-based animations |
| **Lucide React** | Lightweight icon library |
| **Git + GitHub** | Version control and repository hosting |

**Design system:**
- Color palette: dark navy base + cyan/electric blue accent
- Typography: modern geometric sans for body, strong weight contrast for display headings
- Spacing: 4px base unit system throughout
- Backgrounds: Canvas/SVG animations unique to each section (carrier wave, routing grid, spectrum field, modulation layers, beamforming arcs, node topology, protocol bars)

---

## How to Run the Project Locally

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (comes with Node.js)

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/mohamaddib147/mohamad-dib-portfolio.git
```

**2. Navigate into the project folder**

```bash
cd mohamad-dib-portfolio
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open in your browser**

The terminal will show the local URL. By default it will be:

```
http://localhost:5173
```

### Build for production

```bash
npm run build
```

The production-ready files will be output to the `dist/` folder.

### Preview the production build locally

```bash
npm run preview
```

---

## Project Structure

```
mohamad-dib-portfolio/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProjectCard.jsx
│   │   └── SignalBackground.jsx
│   ├── data/
│   │   └── signalVariants.js
│   ├── sections/
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Tools.jsx
│   │   ├── Skills.jsx
│   │   ├── Projects.jsx
│   │   ├── HireMe.jsx
│   │   └── Contact.jsx
│   ├── styles/
│   │   └── main.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Featured Projects

Each project card uses a unique wireless-inspired visual motif that reflects the project's technical domain:

- **Master's Thesis** — Beamforming / RF arc visual (research and wireless systems)
- **VANET Security** — Packet route / network path visual (vehicular network security)
- **IoT Air Quality Monitor** — Node topology visual (IoT systems and telemetry)
- **TCP Protocol Tool** — Signal trail / protocol bars visual (low-level networking)

---

## Author

**Mohamad Dib**  
Master's in Wireless Networking — KTH Royal Institute of Technology  
Specialization in 5G NR, Network Security, Python, MATLAB

- GitHub: [github.com/mohamaddib147](https://github.com/mohamaddib147)
- LinkedIn: [linkedin.com/in/mohamad-dib](https://www.linkedin.com/in/mohamad-dib)
- Email: [mohammaddeeb147@gmail.com](mailto:mohammaddeeb147@gmail.com)

---

*Actively seeking opportunities in wireless systems, network engineering, and software development.*
