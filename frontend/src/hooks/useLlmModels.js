// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import { useState, useEffect, useCallback } from "react";
import { API } from "@/App";

// Static fallback mirroring the pre-gateway hardcoded providers, so the UI
// keeps working if the backend is older or /llm/models is unreachable.
const FALLBACK_PROVIDERS = [
  { key: "deepseek", label: "DeepSeek V4", models: ["deepseek-v4-pro", "deepseek-v4-flash"], default_model: "deepseek-v4-pro", accepts_model: true, cost_in_per_1m: 0.27, cost_out_per_1m: 1.10, priority: 10 },
  { key: "minimax", label: "MiniMax M3", models: ["MiniMax-M3"], default_model: "MiniMax-M3", accepts_model: false, cost_in_per_1m: 0.30, cost_out_per_1m: 1.20, priority: 20 },
  { key: "mimo", label: "MiMo V2 Pro", models: ["mimo-v2-pro"], default_model: "mimo-v2-pro", accepts_model: false, cost_in_per_1m: 1.00, cost_out_per_1m: 3.00, priority: 30 },
  { key: "claude", label: "Claude (Anthropic)", models: ["claude-sonnet-4-20250514", "claude-haiku-4-20250514"], default_model: "claude-sonnet-4-20250514", accepts_model: true, cost_in_per_1m: 3.00, cost_out_per_1m: 15.00, priority: 15 },
  { key: "opencode", label: "OpenCode Zen", models: [], default_model: "", accepts_model: true, cost_in_per_1m: 0.27, cost_out_per_1m: 1.10, priority: 40 },
  { key: "opencode-go", label: "OpenCode Go", models: [], default_model: "", accepts_model: true, cost_in_per_1m: 0.0, cost_out_per_1m: 0.0, priority: 50 },
];

const getToken = () =>
  localStorage.getItem("session_token") ||
  document.cookie.split("session_token=")[1]?.split(";")[0] || "";

/**
 * Catalog of LLM providers enabled server-side (admin-configurable via the
 * LLM gateway). Returns { providers, aliases, loading, fromBackend, reload }.
 * On any failure, providers falls back to the static list (fromBackend=false).
 */
export const useLlmModels = () => {
  const [providers, setProviders] = useState(FALLBACK_PROVIDERS);
  const [aliases, setAliases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromBackend, setFromBackend] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/llm/models`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.providers) ? data.providers : [];
      if (list.length > 0) {
        setProviders(list);
        setAliases(Array.isArray(data?.aliases) ? data.aliases : []);
        setFromBackend(true);
      }
    } catch {
      // keep fallback silently — selectors must never break
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { providers, aliases, loading, fromBackend, reload: load };
};

/** Format a provider's pricing for selector captions. */
export const formatProviderCost = (p) => {
  const cin = p.cost_in_per_1m ?? 0;
  const cout = p.cost_out_per_1m ?? 0;
  if (!cin && !cout) return "Suscripción / sin coste marginal";
  return `$${cin} / $${cout} por 1M tok`;
};

export default useLlmModels;
