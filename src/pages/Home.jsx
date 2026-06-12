// Home.jsx
// Main portfolio layout — sections separated by minimalist RF dividers.

import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionDivider from "../components/SectionDivider";
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
        <SectionDivider />

        <About />
        <SectionDivider />

        <Technologies />
        <SectionDivider />

        <Skills />
        <SectionDivider />

        <Projects />
        <SectionDivider />

        <HireMe />
        <SectionDivider />

        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default Home;
