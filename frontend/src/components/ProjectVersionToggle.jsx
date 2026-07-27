// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

/**
 * Reusable toggle switch for activating/deactivating a project version.
 *
 * Props:
 *   version      — ProjectVersion object { id, version_number, active, impact_summary }
 *   onToggle     — (versionId: string, active: boolean) => void
 *   loading      — boolean (optional)
 */
export default function ProjectVersionToggle({ version, onToggle, loading }) {
  const isActive = version.active;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => onToggle(version.id, !isActive)}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase tracking-wide border-2 rounded-lg transition-colors ${
        isActive
          ? "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-zinc-300 bg-white text-zinc-500 hover:bg-zinc-100"
      }`}
      title={isActive ? "Deactivate this version" : "Activate this version"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isActive ? (
        <ToggleRight className="w-3.5 h-3.5" />
      ) : (
        <ToggleLeft className="w-3.5 h-3.5" />
      )}
      <span>{isActive ? "ON" : "OFF"}</span>
    </button>
  );
}
