'use client';

import React, { ReactNode } from 'react';
import { useEffect } from "react"
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface I18nClientProviderProps {
  children: ReactNode;
}

export default function I18nClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const storedLang = typeof window !== "undefined" ? localStorage.getItem("language") : null
    if (storedLang && i18n.language !== storedLang) {
      i18n.changeLanguage(storedLang)
    }
  }, [])
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}