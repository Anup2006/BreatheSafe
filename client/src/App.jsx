import Header from "./Components/Header/Header.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

function App() {
 useEffect(() => {
    // Load Botpress webchat scripts dynamically
    const injectScript = document.createElement("script");
    injectScript.src = "https://cdn.botpress.cloud/webchat/v3.3/inject.js";
    injectScript.async = true;

    const configScript = document.createElement("script");
    configScript.src = "https://files.bpcontent.cloud/2025/11/04/16/20251104160622-NJYAFMWS.js";
    configScript.defer = true;

    document.body.appendChild(injectScript);
    document.body.appendChild(configScript);

    return () => {
      // Cleanup when component unmounts
      document.body.removeChild(injectScript);
      document.body.removeChild(configScript);
    };
  }, []);
  return (
    <>
      <Header />
      {/* This will render the child routes like Home,  Dashboard, etc. */}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
