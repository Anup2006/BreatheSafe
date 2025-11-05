import Header from "./Components/Header/Header.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Create the inject.js script
    const injectScript = document.createElement("script");
    injectScript.src = "https://cdn.botpress.cloud/webchat/v3.3/inject.js";
    injectScript.async = true;

    // When inject.js is done loading, then load the config script
    injectScript.onload = () => {
      const configScript = document.createElement("script");
      configScript.src = "https://files.bpcontent.cloud/2025/11/04/16/20251104160622-NJYAFMWS.js";
      configScript.defer = true;
      document.body.appendChild(configScript);
    };

    document.body.appendChild(injectScript);

    // Cleanup when component unmounts
    return () => {
      document.body.removeChild(injectScript);
      const configScripts = document.querySelectorAll(
        'script[src*="bpcontent.cloud"]'
      );
      configScripts.forEach((s) => document.body.removeChild(s));
    };
  }, []);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
