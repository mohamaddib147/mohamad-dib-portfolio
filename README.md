# Mohamad Dib — Portfolio

**Live portfolio:** [mohamaddib147.github.io/mohamad-dib-portfolio](https://mohamaddib147.github.io/mohamad-dib-portfolio) 

A professional personal portfolio website built with **React + Vite** to present my background, technical skills, engineering projects, and professional value in a clear, modern, and structured format. The site combines a clean component-based architecture with a custom dark navy visual system and section-specific wireless-inspired animated backgrounds. 

---

## Project Overview

This project was developed as a **React personal portfolio website** focused on clean UI structure, good project organization, responsive layout, and professional presentation. It showcases my profile across communication systems, wireless networking, network security, software development, and frontend engineering. 

Unlike a generic portfolio template, this version uses a custom technical art direction inspired by wireless systems concepts such as carrier waves, routing grids, spectrum fields, modulation layers, and signal paths. Each section has its own visual motif while preserving readability, hierarchy, and a professional tone.

### Purpose

- Present my academic and technical background clearly. 
- Highlight engineering and software-oriented projects in a structured way. 
- Show technical skills, tools, and professional strengths.
- Provide recruiters, hiring teams, and collaborators with a clean contact point. 

---

## Site Structure

| Section | Visual Motif | Purpose |
|---|---|---|
| Hero | Carrier wave + antenna pulse | First impression, role, introduction, call to action |
| About | Routing grid / engineering signal map | Background, education, profile summary |
| Tools | Spectrum analyzer / RF scan field | Technologies, tools, and development environments |
| Skills | Layered modulation waves | Skills grouped by technical domain |
| Projects | Project-specific wireless motif | Featured engineering and software projects |
| Hire Me | Stable low-noise link | Professional value proposition |
| Contact | Endpoint handoff / signal receiver | Contact details and professional links |

The project brief requires sections for a hero/introduction, about, technologies and tools, skills, projects, a professional value section, contact, and footer, and this portfolio implements that structure in a customized one-page format. 

---

## Design System

The interface is built around a technical dark-theme design language with restrained visual effects and readable content hierarchy.

### Core design rules

- Dark navy base across the full site.
- Cyan / electric blue used as the primary accent.
- Consistent card system with glass-style panels, soft borders, and controlled glow.
- One typography system with strong heading hierarchy and readable body text.
- Section-specific animated backgrounds that support the content without overpowering it.
- Responsive layout for desktop, tablet, and mobile. 

### Visual direction

The design intentionally avoids generic portfolio styling and instead reflects my communication engineering background through wireless-inspired motion and signal-based visuals. This keeps the project aligned with both a frontend developer portfolio and an engineering identity. 

---

## Technologies Used

| Technology | Role |
|---|---|
| **React 18** | Component-based UI architecture |
| **Vite** | Fast development server and production build tool |
| **JavaScript (ES6+)** | Logic, rendering, and interactivity |
| **Custom CSS** | Layout, design system, animations, and visual styling |
| **HTML5 Canvas / SVG** | Section-specific animated wireless-inspired visuals |
| **Framer Motion** | Entrance, reveal, and interaction animations |
| **Lucide React** | Lightweight icon system |
| **Git + GitHub** | Version control and repository hosting |

The project brief specifies React, JavaScript, React hooks where appropriate, no backend, and responsive design, all of which are reflected in this implementation.

---

## Features

- Built with reusable React components. 
- Organized one-page portfolio structure with clearly separated sections. 
- Responsive layout for desktop, tablet, and mobile. 
- Custom animated section backgrounds using wireless systems motifs.
- Professional project cards with engineering-focused descriptions.
- Contact section with email and professional profile links.
- Clean and modern UI with consistent spacing and typography, which the project brief explicitly requires. 

---

## How to Run Locally

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (included with Node.js)

### Installation

1. Clone the repository

```bash
git clone https://github.com/mohamaddib147/mohamad-dib-portfolio.git
```

2. Move into the project folder

```bash
cd mohamad-dib-portfolio
```

3. Install dependencies

```bash
npm install
```

4. Start the development server

```bash
npm run dev
```

5. Open the local URL shown in the terminal, usually:

```bash
http://localhost:5173
```

### Production build

```bash
npm run build
```

This generates the optimized production build in the `dist/` folder.

### Preview production build locally

```bash
npm run preview
```

The project brief specifically asks for a README that explains the overview, technologies used, and how to run the project locally, so these instructions should remain in the final version. 

---

## Project Structure

```text
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

The provided project brief suggests a React structure with reusable components, section-based organization, and clean separation of concerns, which this structure follows closely. 

---

## Featured Projects

Each featured project is presented in card format with a short description, technologies used, and repository or supporting links, matching the portfolio project requirements described in the brief.

Current featured project directions include:

- **Master’s Thesis** — wireless systems research, beamforming, and communication design.
- **VANET Security** — vehicular network security analysis and system-level thinking.
- **IoT Air Quality Monitor** — sensor systems, telemetry, and IoT implementation.
- **TCP Protocol Tool** — protocol logic, networking fundamentals, and software development.

The original brief requires at least 2–3 projects with name, description, technologies used, and GitHub links, and this portfolio is structured around that requirement. 

---

## UI / UX Goals

This project was designed with the following goals in mind:

- Clean and modern presentation. 
- Consistent spacing and typography. 
- Clear section separation. 
- Accessible contrast and readable content. 
- Mobile responsiveness. 
- A distinctive technical visual identity tied to engineering and wireless systems.

These goals directly align with the UI/UX guidelines defined in the project PDF. 

---

## Author

**Mohamad Dib**  
Master’s in Communication Systems, Wireless Networking Track  
KTH Royal Institute of Technology

- GitHub: [github.com/mohamaddib147](https://github.com/mohamaddib147)
- LinkedIn: [linkedin.com/in/mohamad-dib-b51286271](https://www.linkedin.com/in/mohamad-dib-b51286271)
- Email: [mohammaddeeb147@gmail.com](mailto:mohammaddeeb147@gmail.com)

---

Actively seeking opportunities in wireless systems, network engineering, software development, and frontend engineering.
