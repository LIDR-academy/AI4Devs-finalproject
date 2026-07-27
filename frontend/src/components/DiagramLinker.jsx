// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState, useMemo } from "react";
import { API } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, FileCode, Search } from "lucide-react";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/**
 * Multi-select for BPMN diagrams.
 * Props:
 *  - value: array of diagram ids currently linked
 *  - onChange: (newIds: string[]) => void
 *  - placeholder: optional string
 */
const DiagramLinker = ({ value = [], onChange, placeholder = "Buscar diagrama…" }) => {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/diagrams`, { headers: authHeaders(), credentials: "include" });
        if (res.ok) setDiagrams(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byId = useMemo(() => {
    const m = {};
    diagrams.forEach((d) => { m[d.id] = d; });
    return m;
  }, [diagrams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const notLinked = diagrams.filter((d) => !value.includes(d.id));
    if (!q) return notLinked.slice(0, 8);
    return notLinked
      .filter((d) => (d.name || "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [diagrams, value, query]);

  const add = (id) => {
    onChange([...value, id]);
    setQuery("");
    setShowDropdown(false);
  };

  const remove = (id) => {
    onChange(value.filter((x) => x !== id));
  };

  return (
    <div className="space-y-2" data-testid="diagram-linker">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((id) => (
            <Badge
              key={id}
              variant="outline"
              className="rounded-lg border-zinc-400 bg-zinc-50 font-mono text-xs gap-1.5 pr-1"
              data-testid={`linked-diagram-${id}`}
            >
              <FileCode className="w-3 h-3" />
              <span className="max-w-[14rem] truncate">{byId[id]?.name || id.slice(0, 8)}</span>
              <button
                type="button"
                onClick={() => remove(id)}
                className="text-zinc-500 hover:text-red-600 ml-1"
                aria-label="Quitar"
                data-testid={`unlink-diagram-${id}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input with dropdown */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
          placeholder={loading ? "Cargando…" : placeholder}
          disabled={loading}
          className="pl-8 rounded-lg h-9"
          data-testid="diagram-linker-input"
        />
        {showDropdown && filtered.length > 0 && (
          <div
            className="absolute z-30 left-0 right-0 mt-1 border border-zinc-200 bg-white shadow-lg max-h-56 overflow-y-auto"
            data-testid="diagram-linker-dropdown"
          >
            {filtered.map((d) => (
              <button
                key={d.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(d.id); }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-100 border-b border-zinc-200 last:border-b-0 flex items-center gap-2"
                data-testid={`diagram-linker-option-${d.id}`}
              >
                <FileCode className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">{d.name}</div>
                  {d.description && <div className="text-xs text-zinc-500 truncate">{d.description}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
        {showDropdown && !loading && query && filtered.length === 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-500 italic">
            Sin coincidencias.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramLinker;
