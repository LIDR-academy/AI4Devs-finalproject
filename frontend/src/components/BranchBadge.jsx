// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "@/App";
import { GitBranch } from "lucide-react";

function authHeaders() {
  const tk = localStorage.getItem("session_token");
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

/**
 * Badge that shows the active branch name for a project.
 * Clicking navigates to /versions for version selection.
 *
 * Props:
 *   projectId — the project ID to fetch the active branch for
 */
export default function BranchBadge({ projectId }) {
  const navigate = useNavigate();
  const [branchName, setBranchName] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    fetch(`${API}/projects/${projectId}/branches`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled || !data) return;
        const active = data.find((b) => b.active);
        if (active) setBranchName(active.name);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [projectId]);

  if (!branchName) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(`/projects/${projectId}/versions`)}
      title="Ir a versiones"
      className="inline-flex items-center border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-emerald-700 rounded-lg font-mono text-xs bg-emerald-600 text-white cursor-pointer"
    >
      <GitBranch className="w-3 h-3 mr-1" aria-hidden="true" />
      {branchName}
    </button>
  );
}
