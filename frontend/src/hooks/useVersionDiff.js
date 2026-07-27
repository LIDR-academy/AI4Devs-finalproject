// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { API } from "@/App";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/**
 * Manages the version-diff sub-state of the BPMN editor:
 *   - dialog open/close
 *   - which two versions are being compared
 *   - the diff payload from the backend
 *   - loading flag
 *
 * Exposes a single async `fetchDiff(diagramId, v1, v2)` that opens the dialog
 * with the result; callers do not need to wire setDiffDialogOpen separately.
 */
export const useVersionDiff = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [data, setData] = useState(null);
  const [versionA, setVersionA] = useState(null);
  const [versionB, setVersionB] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDiff = useCallback(async (diagramId, v1, v2) => {
    if (!v1 || !v2 || v1 === v2) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API}/diagrams/${diagramId}/versions/${v1}/diff/${v2}`,
        { headers: authHeaders() }
      );
      if (response.ok) {
        setData(await response.json());
        setDialogOpen(true);
      } else {
        toast.error("Error al comparar versiones");
      }
    } catch {
      toast.error("Error al comparar versiones");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setVersionA(null);
    setVersionB(null);
    setLoading(false);
    setDialogOpen(false);
  }, []);

  return {
    diffDialogOpen: dialogOpen,
    setDiffDialogOpen: setDialogOpen,
    diffData: data,
    setDiffData: setData,
    diffVersionA: versionA,
    setDiffVersionA: setVersionA,
    diffVersionB: versionB,
    setDiffVersionB: setVersionB,
    loadingDiff: loading,
    fetchDiff,
    resetDiff: reset,
  };
};
