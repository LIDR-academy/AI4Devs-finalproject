// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import { useState, useCallback } from "react";
import { API } from "@/App";
import { toast } from "sonner";

export const useLimits = () => {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState({ type: "", max: 0, current: 0 });

  const getToken = () => {
    const cookieToken = document.cookie.split("session_token=")[1]?.split(";")[0];
    return cookieToken || localStorage.getItem("session_token") || "";
  };

  const checkLimit = useCallback(async (limitType) => {
    try {
      const token = getToken();
      if (!token) return true;
      const res = await fetch(`${API}/auth/limits`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) return true;
      const data = await res.json();
      if (!data.restricted) return true;
      const limit = data.limits?.[limitType];
      if (!limit) return true;
      if (!limit.allowed) {
        setUpgradeInfo({ type: limitType, max: limit.max, current: limit.current });
        setUpgradeOpen(true);
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }, []);

  const closeUpgrade = useCallback(() => setUpgradeOpen(false), []);

  return { checkLimit, upgradeOpen, upgradeInfo, closeUpgrade };
};
