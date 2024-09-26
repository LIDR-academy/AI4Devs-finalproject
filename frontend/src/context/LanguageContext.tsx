import React, { createContext, useState, useContext, ReactNode } from 'react';
import localesData from '../locales/locales.json'; 
import { LanguageContextProps, Language, LocalesData } from '../types/global';

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ES');

  const translator = (key: string) => {
    const locale = (localesData as LocalesData).locales.find(
      (locale) => locale.language.toUpperCase() === language
    );

    if (!locale) {
      console.error(`Locale for language ${language} not found.`);
      return key;
    }

    const message = locale.messages.find((msg) => msg.key === key);
    return message ? message.value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translator }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};