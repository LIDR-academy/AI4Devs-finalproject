'use client';

import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import es from "./es.json"
import en from "./en.json"

// Este objeto no cambiará entre renderizados
const resources = {
  es: { translation: es },
  en: { translation: en },
}

// Solo inicializa i18n una vez
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: "es",
      fallbackLng: "es",
      debug: false,
      interpolation: { escapeValue: false },
    })
}

export default i18n