import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import caCommon from './locales/ca/common.json';
import caTrips from './locales/ca/trips.json';
import caMatches from './locales/ca/matches.json';
import caBookings from './locales/ca/bookings.json';
import caProfile from './locales/ca/profile.json';
import caHistory from './locales/ca/history.json';
import caTrust from './locales/ca/trust.json';
import caValidation from './locales/ca/validation.json';
import caNotifications from './locales/ca/notifications.json';

import esCommon from './locales/es/common.json';
import esTrips from './locales/es/trips.json';
import esMatches from './locales/es/matches.json';
import esBookings from './locales/es/bookings.json';
import esProfile from './locales/es/profile.json';
import esHistory from './locales/es/history.json';
import esTrust from './locales/es/trust.json';
import esValidation from './locales/es/validation.json';
import esNotifications from './locales/es/notifications.json';

import roCommon from './locales/ro/common.json';
import roTrips from './locales/ro/trips.json';
import roMatches from './locales/ro/matches.json';
import roBookings from './locales/ro/bookings.json';
import roProfile from './locales/ro/profile.json';
import roHistory from './locales/ro/history.json';
import roTrust from './locales/ro/trust.json';
import roValidation from './locales/ro/validation.json';
import roNotifications from './locales/ro/notifications.json';

import ukCommon from './locales/uk/common.json';
import ukTrips from './locales/uk/trips.json';
import ukMatches from './locales/uk/matches.json';
import ukBookings from './locales/uk/bookings.json';
import ukProfile from './locales/uk/profile.json';
import ukHistory from './locales/uk/history.json';
import ukTrust from './locales/uk/trust.json';
import ukValidation from './locales/uk/validation.json';
import ukNotifications from './locales/uk/notifications.json';

import enCommon from './locales/en/common.json';
import enTrips from './locales/en/trips.json';
import enMatches from './locales/en/matches.json';
import enBookings from './locales/en/bookings.json';
import enProfile from './locales/en/profile.json';
import enHistory from './locales/en/history.json';
import enTrust from './locales/en/trust.json';
import enValidation from './locales/en/validation.json';
import enNotifications from './locales/en/notifications.json';

import frCommon from './locales/fr/common.json';
import frTrips from './locales/fr/trips.json';
import frMatches from './locales/fr/matches.json';
import frBookings from './locales/fr/bookings.json';
import frProfile from './locales/fr/profile.json';
import frHistory from './locales/fr/history.json';
import frTrust from './locales/fr/trust.json';
import frValidation from './locales/fr/validation.json';
import frNotifications from './locales/fr/notifications.json';

const resources = {
  ca: {
    common: caCommon,
    trips: caTrips,
    matches: caMatches,
    bookings: caBookings,
    profile: caProfile,
    history: caHistory,
    trust: caTrust,
    validation: caValidation,
    notifications: caNotifications,
  },
  es: {
    common: esCommon,
    trips: esTrips,
    matches: esMatches,
    bookings: esBookings,
    profile: esProfile,
    history: esHistory,
    trust: esTrust,
    validation: esValidation,
    notifications: esNotifications,
  },
  ro: {
    common: roCommon,
    trips: roTrips,
    matches: roMatches,
    bookings: roBookings,
    profile: roProfile,
    history: roHistory,
    trust: roTrust,
    validation: roValidation,
    notifications: roNotifications,
  },
  uk: {
    common: ukCommon,
    trips: ukTrips,
    matches: ukMatches,
    bookings: ukBookings,
    profile: ukProfile,
    history: ukHistory,
    trust: ukTrust,
    validation: ukValidation,
    notifications: ukNotifications,
  },
  en: {
    common: enCommon,
    trips: enTrips,
    matches: enMatches,
    bookings: enBookings,
    profile: enProfile,
    history: enHistory,
    trust: enTrust,
    validation: enValidation,
    notifications: enNotifications,
  },
  fr: {
    common: frCommon,
    trips: frTrips,
    matches: frMatches,
    bookings: frBookings,
    profile: frProfile,
    history: frHistory,
    trust: frTrust,
    validation: frValidation,
    notifications: frNotifications,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Default language
    fallbackLng: 'en',
    defaultNS: 'common',
    supportedLngs: ['ca', 'es', 'ro', 'uk', 'en', 'fr'],
    interpolation: { 
      escapeValue: false 
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
