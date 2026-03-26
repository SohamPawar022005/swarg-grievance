import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { LangCode, translations, languages } from '@/i18n/translations';

interface LanguageContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<LangCode>('en');

  const t = useCallback(
    (key: string): string => {
      const dict = translations[lang];
      return (dict as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { languages };
