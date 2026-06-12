// Home page container.
// Main portfolio layout with section dividers,
// sticky header support, and footer.

import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../sections/Hero";
import About from "../sections/About";
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
        <div className="section-divider" />

        <About />
        <div className="section-divider" />

        <Technologies />
        <div className="section-divider" />

        <Skills />
        <div className="section-divider" />

        <Projects />
        <div className="section-divider" />

        <HireMe />
        <div className="section-divider" />

        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default Home;