import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations.js';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (key, params) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('daybook_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang) => {
    const validLang = newLang === 'hi' ? 'hi' : 'en';
    setLangState(validLang);
    try {
      localStorage.setItem('daybook_lang', validLang);
      document.documentElement.lang = validLang;
    } catch {}
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, params = {}, fallback = '') => {
    const dict = translations[lang] || translations.en;
    let str = dict[key] || translations.en[key] || fallback || key;

    // Parameter interpolation: {name}, {prof}, etc.
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
