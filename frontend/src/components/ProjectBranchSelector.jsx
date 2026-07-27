// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { GitBranch, Check, ChevronDown } from "lucide-react";

/**
 * Branch selector dropdown for the project header/navigation.
 *
 * Props:
 *   branches       — array of branch objects { id, name, active, is_default }
 *   activeBranchId — currently active branch ID
 *   onSwitch       — (branchId: string) => void
 *   loading        — boolean (optional)
 */
export default function ProjectBranchSelector({ branches, activeBranchId, onSwitch, loading }) {
  const activeBranch = branches.find((b) => b.id === activeBranchId);

  if (!branches || branches.length <= 1) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-lg">
        <GitBranch className="w-3 h-3" />
        {activeBranch?.name || "main"}
      </span>
    );
  }

  return (
    <div className="relative inline-block group">
      <button
        type="button"
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs font-mono font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 hover:border-zinc-400 px-2 py-1 rounded-lg transition-colors"
      >
        {loading ? (
          <span className="w-3 h-3 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <GitBranch className="w-3 h-3" />
        )}
        <span>{activeBranch?.name || "main"}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* dropdown */}
      <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-white border-2 border-zinc-200 shadow-[4px_4px_0_#000] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {branches.map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={loading || b.id === activeBranchId}
            onClick={() => onSwitch(b.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left hover:bg-zinc-100 transition-colors ${
              b.id === activeBranchId ? "bg-emerald-50 text-emerald-700 font-bold" : "text-zinc-700"
            }`}
          >
            <GitBranch className={`w-3 h-3 ${b.id === activeBranchId ? "text-emerald-600" : "text-zinc-400"}`} />
            <span className="flex-1 truncate">{b.name}</span>
            {b.id === activeBranchId && <Check className="w-3 h-3 text-emerald-600" />}
            {b.is_default && (
              <span className="text-[10px] text-zinc-400 border border-zinc-300 px-1 rounded-lg">default</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
