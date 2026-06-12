# Mohamad Dib Portfolio

A professional single-page portfolio built with React and Vite to showcase Mohamad Dib’s background in Communication Engineering, wireless systems, networking, and frontend development.

The project combines a dark technical design system with wireless-inspired visuals such as signal waves, spectrum patterns, and structured section backgrounds to reflect both engineering depth and frontend craftsmanship.

## Project Overview

This portfolio is designed to present:
- Professional background and academic journey
- Technical tools and engineering skills
- Selected software and engineering projects
- A clear contact section for professional opportunities

The website follows a modern single-page structure and is being developed with reusable React components, custom CSS, and motion-based interactions. The visual direction is based on a dark technical UI with section-aware signal motifs that connect the design to communication systems engineering.

## Technologies Used

| Technology | Purpose |
|------------|---------|
| React | Component-based UI development |
| Vite | Fast development server and build tooling |
| Framer Motion | Entrance and scroll-based animations |
| Lucide React | Lightweight icon library |
| Custom CSS | Styling, layout, effects, and responsive design |

## Design Direction

The design is based on a wireless engineering theme:
- Dark navy technical interface
- Soft cyan and electric-blue accents
- Reusable signal-inspired visual system
- Section-based layout with distinct visual identity
- Responsive structure for mobile and desktop

The goal is to create a portfolio that feels technical, modern, and professional without sacrificing readability.

## Current Progress

### Completed
- Hero section
- About section
- Reusable signal background component
- Signal variant data structure
- Global stylesheet and design system foundation

### In Progress
- Technologies & Tools section
- Skills section
- Projects section
- Hire Me section
- Contact section

## Folder Structure

```bash
src/
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProjectCard.jsx
│   └── SignalBackground.jsx
├── data/
│   └── signalVariants.js
├── pages/
│   └── Home.jsx
├── sections/
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Technologies.jsx
│   ├── Skills.jsx
│   ├── Projects.jsx
│   ├── HireMe.jsx
│   └── Contact.jsx
├── styles/
│   └── main.css
├── App.jsx
└── main.jsx
```

## Features

- Single-page portfolio architecture
- Reusable section background system using SVG and CSS
- Framer Motion entrance and scroll reveal animations
- Engineering-focused content structure
- Smooth scrolling between sections
- Responsive layouts for mobile and desktop
- Reusable project card and section-based composition

## How to Run the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY-NAME.git
```

### 2. Move into the project folder

```bash
cd YOUR-REPOSITORY-NAME
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the local development URL

Vite usually runs on:

```bash
http://localhost:5173
```

## Development Notes

This project follows a few core conventions:
- All major sections are built as separate React components.
- Visual signal effects are reusable and not hardcoded per section.
- Styling is handled through a global custom stylesheet.
- Animations are used with purpose, not as decoration only.
- Section IDs match anchor links for smooth in-page navigation.
- Responsive behavior is required for both mobile and desktop layouts.

## Planned Improvements

- Complete the remaining portfolio sections
- Add custom background variants for every section
- Refine project cards with stronger visual identity
- Improve typography with a custom web font
- Add optional sticky navigation
- Add scroll-tracking for active section state
- Final polish for deployment and presentation

## Author

**Mohamad Dib**  
Communication Engineering and Frontend Portfolio

## Contact

- Email: [mohammaddeeb147@gmail.com](mailto:mohammaddeeb147@gmail.com)

---

This repository contains the source code for an evolving portfolio project focused on combining engineering identity with modern frontend presentation.