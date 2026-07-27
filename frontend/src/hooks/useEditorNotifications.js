// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import { useEffect, useState, useCallback } from "react";
import { API } from "@/App";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/**
 * Encapsulates notification state (list + unread count) for the BPMN editor.
 * Pure read-side: re-fetches on demand and on mount; mutations belong to the
 * caller (mark-as-read endpoints) which then call `refresh()`.
 */
export const useEditorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        fetch(`${API}/notifications`, { headers: authHeaders() }),
        fetch(`${API}/notifications/unread-count`, { headers: authHeaders() }),
      ]);
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (countRes.ok) setUnreadCount((await countRes.json()).count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { notifications, unreadCount, refresh, setNotifications, setUnreadCount };
};
