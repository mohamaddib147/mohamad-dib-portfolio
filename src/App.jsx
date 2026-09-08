import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import SignalScrollMeter from "./components/SignalScrollMeter";

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
    <>
      <Home />
      <SignalScrollMeter />
    </>
  );
}

export default App;