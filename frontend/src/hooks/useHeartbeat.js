import { useEffect, useRef } from "react";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";

const HEARTBEAT_INTERVAL_MS = 60_000;

export const useHeartbeat = (isAuthenticated) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const ping = () => {
      fetch(`${API}/llm/heartbeat`, {
        method: "POST",
        headers: getAuthHeaders(),
      }).catch(() => {});
    };

    ping();
    timerRef.current = setInterval(ping, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated]);
};

export default useHeartbeat;
