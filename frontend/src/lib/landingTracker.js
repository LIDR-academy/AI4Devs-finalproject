// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

/**
 * Lightweight landing analytics tracker.
 *
 * - Generates a stable anonymous ID stored in localStorage.
 * - Posts events to /api/landing/events with `keepalive: true` so they
 *   survive page navigations.
 * - Silently swallows errors; analytics must never break the user's flow.
 */
const ANON_KEY = "sdd_anon_id";

function getAnonId() {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "anon_unknown";
  }
}

function getLang() {
  try {
    return localStorage.getItem("app_lang") || (navigator.language || "es").slice(0, 2);
  } catch {
    return "es";
  }
}

const API = process.env.REACT_APP_BACKEND_URL;

export function track(eventType, properties = {}) {
  if (!API) return;
  const body = JSON.stringify({
    event_type: eventType,
    anon_id: getAnonId(),
    properties: properties || {},
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    path: typeof location !== "undefined" ? location.pathname : null,
    lang: getLang(),
  });
  try {
    fetch(`${API}/api/landing/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
