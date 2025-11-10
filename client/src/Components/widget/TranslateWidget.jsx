import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

function TranslateWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const { changeLanguage: syncLanguage } = useLanguage(); 

  useEffect(() => {
    // Prevent duplicate script loading
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const addScript = document.createElement("script");
      addScript.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(addScript);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "hi,mr,ta,bn,gu,ml,te,kn,pa",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // ✅ Check cookies AND hash on load to set initial language
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const googtransCookie = getCookie('googtrans');
    const hash = window.location.hash;

    if (googtransCookie && googtransCookie !== '/en/en') {
      // Cookie format: /en/hi (from/to)
      const langMatch = googtransCookie.match(/\/en\/(\w+)/);
      if (langMatch) {
        setSelectedLang(langMatch[1]);
      }
    } else if (hash.includes("googtrans")) {
      const match = hash.match(/googtrans\(en\|(\w+)\)/);
      if (match) {
        setSelectedLang(match[1]);
      }
    } else {
      setSelectedLang("en");
    }
  }, []);

  const languages = {
    en: { name: "English", native: "English" },
    hi: { name: "Hindi", native: "हिन्दी" },
    mr: { name: "Marathi", native: "मराठी" },
  };

  const changeLanguage = (langCode) => {
    setSelectedLang(langCode);
    setIsOpen(false);
    syncLanguage(langCode);

    const domain = window.location.hostname;
    const now = new Date();
    const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    if (langCode === "en") {
      // ✅ Clear ALL translation cookies and hash
      // Set cookies to expire in the past to delete them
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `googtrans=; path=/; domain=.${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      
      // Also try setting to /en/en (which resets to English)
      document.cookie = `googtrans=/en/en; path=/; expires=${expires.toUTCString()};`;
      document.cookie = `googtrans=/en/en; path=/; domain=${domain}; expires=${expires.toUTCString()};`;
      document.cookie = `googtrans=/en/en; path=/; domain=.${domain}; expires=${expires.toUTCString()};`;

      // Clear hash
      if (window.location.hash) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
      
      // Reload to apply changes
      window.location.reload();
    } else {
      // ✅ Set translation cookie with proper expiry
      document.cookie = `googtrans=/en/${langCode}; path=/; expires=${expires.toUTCString()};`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}; expires=${expires.toUTCString()};`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain}; expires=${expires.toUTCString()};`;

      // Set hash
      window.location.hash = `#googtrans(en|${langCode})`;
      
      // Reload to apply translation
      window.location.reload();
    }
  };

  return (
    <div className="relative" translate="no">
      {/* ✅ Hidden Google Translate widget */}
      <div className="hidden">
        <div id="google_translate_element"></div>
      </div>

      {/* ✅ Custom dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-teal-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50"
      >
        <svg
          className="w-4 h-4 text-teal-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {languages[selectedLang]?.native || "English"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* ✅ Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
            {Object.entries(languages).map(([code, { name, native }]) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors duration-150 flex items-center justify-between group ${
                  selectedLang === code ? "bg-teal-50 text-teal-600" : ""
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-teal-600">
                    {native}
                  </span>
                  <span className="text-xs text-gray-500">{name}</span>
                </div>
                {selectedLang === code && (
                  <svg
                    className="w-4 h-4 text-teal-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default TranslateWidget;
