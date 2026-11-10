import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import SignalScrollMeter from "./components/SignalScrollMeter";
import AskWidget from "./components/AskWidget";

function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (hash === "#studio") {
    return <Admin />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <Home />
      <SignalScrollMeter />
      <AskWidget />
    </MotionConfig>
  );
}

export default App;