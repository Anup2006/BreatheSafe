import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    
    // ✅ Notify Botpress of language change
    if (window.botpressWebChat) {
      window.botpressWebChat.sendEvent({
        type: 'proactiveEvent',
        payload: { language: langCode }
      });
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
