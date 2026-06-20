import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en.json';
import es from './es.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: Localization.getLocales()[0]?.languageCode ?? 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;
