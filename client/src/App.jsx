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
      configScript.src =
        "https://files.bpcontent.cloud/2025/11/04/16/20251104160622-NJYAFMWS.js";
      configScript.defer = true;

      // ✅ Wait for config to load, then set language
      configScript.onload = () => {
        initializeBotpressLanguage();
      };

      document.body.appendChild(configScript);
    };

    document.body.appendChild(injectScript);

    // Cleanup when component unmounts
    return () => {
      if (injectScript.parentNode) {
        document.body.removeChild(injectScript);
      }
      const configScripts = document.querySelectorAll(
        'script[src*="bpcontent.cloud"]'
      );
      configScripts.forEach((s) => {
        if (s.parentNode) {
          document.body.removeChild(s);
        }
      });
    };
  }, []);

  // ✅ Function to initialize Botpress with language detection
  const initializeBotpressLanguage = () => {
    // Get current language from cookies or hash
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const googtransCookie = getCookie("googtrans");
    const hash = window.location.hash;
    let currentLang = "en";

    if (googtransCookie && googtransCookie !== "/en/en") {
      const langMatch = googtransCookie.match(/\/en\/(\w+)/);
      if (langMatch) {
        currentLang = langMatch[1];
      }
    } else if (hash.includes("googtrans")) {
      const match = hash.match(/googtrans\(en\|(\w+)\)/);
      if (match) {
        currentLang = match[1];
      }
    }
    // ✅ Set Botpress language
    if (window.botpressWebChat) {
      // Send language to bot via event
      window.botpressWebChat.sendEvent({
        type: "proactiveEvent",
        payload: { language: currentLang },
      });

      // Also send as user variable
      window.botpressWebChat.sendPayload({
        type: "text",
        text: `/setLanguage ${currentLang}`,
        hide: true,
      });

      window.botpressWebChat.sendPayload({
        type: "text",
        text: "Hey there! 👋 I’m your BreatheSafeAI assistant. Want to check your air safety today?",
      });
    }
  };

  // ✅ Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setTimeout(initializeBotpressLanguage, 500);
    };

    window.addEventListener("hashchange", handleLanguageChange);
    return () => window.removeEventListener("hashchange", handleLanguageChange);
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
