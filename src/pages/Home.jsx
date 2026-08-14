import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionDivider from "../components/SectionDivider";
import Hero from "../sections/Hero";
import About from "../sections/About";
import Experience from "../sections/Experience";
import Technologies from "../sections/Technologies";
import Skills from "../sections/Skills";
import Projects from "../sections/Projects";
import HireMe from "../sections/HireMe";
import Contact from "../sections/Contact";

function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <SectionDivider variant="hero-about" />

        <About />
        <SectionDivider variant="about-experience" />

        <Experience />
        <SectionDivider variant="experience-tools" />

        <Technologies />
        <SectionDivider variant="tools-skills" />

        <Skills />
        <SectionDivider variant="skills-projects" />

        <Projects />
        <SectionDivider variant="projects-hire" />

        <HireMe />
        <SectionDivider variant="hire-contact" />

        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default Home;