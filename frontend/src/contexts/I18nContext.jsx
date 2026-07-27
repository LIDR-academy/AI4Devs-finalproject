// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import defaultTranslations, { SUPPORTED_LANGUAGES } from "@/i18n/translations";
import { API } from "@/App";

const I18nContext = createContext(null);

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) return { t: (k) => k, lang: "es", setLang: () => {}, languages: SUPPORTED_LANGUAGES };
  return ctx;
};

// Detect the user's preferred language from the browser, with fallback to "es".
// Order: localStorage override → navigator.languages[] → navigator.language → "es".
// Only matches against languages that are actually supported by the app.
const detectInitialLang = () => {
  const stored = localStorage.getItem("app_lang");
  if (stored) return stored;
  const supported = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
  const candidates = [
    ...(navigator.languages || []),
    navigator.language || "",
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const code = raw.toLowerCase().split("-")[0];
    if (supported.has(code)) return code;
  }
  return "es";
};

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(detectInitialLang);
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    // Load custom overrides from backend
    fetch(`${API}/i18n/translations`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setOverrides(data); })
      .catch(() => {});
  }, []);

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem("app_lang", newLang);
    // Try to save to backend if authenticated
    const token = document.cookie.split("session_token=")[1]?.split(";")[0] || "";
    if (token) {
      fetch(`${API}/i18n/user-language`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ language: newLang }),
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    // Load user preference from backend on mount
    const token = document.cookie.split("session_token=")[1]?.split(";")[0] || "";
    if (token) {
      fetch(`${API}/i18n/user-language`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.language && data.language !== lang) {
            setLangState(data.language);
            localStorage.setItem("app_lang", data.language);
          }
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = useCallback(
    (key) => {
      // Priority: backend overrides > default translations > key itself
      if (overrides[lang]?.[key]) return overrides[lang][key];
      return defaultTranslations[lang]?.[key] || defaultTranslations["es"]?.[key] || key;
    },
    [lang, overrides]
  );

  const contextValue = useMemo(() => ({
    t, lang, setLang, languages: SUPPORTED_LANGUAGES, overrides, setOverrides
  }), [t, lang, setLang, overrides, setOverrides]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};
