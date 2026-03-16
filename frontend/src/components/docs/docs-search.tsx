"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { SEARCH_INDEX, type SearchEntry } from "@/lib/docs-search-index";

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-100 text-emerald-800 rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function searchIndex(query: string): SearchEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return SEARCH_INDEX.filter(
    (entry) =>
      entry.title.toLowerCase().includes(q) ||
      entry.excerpt.toLowerCase().includes(q) ||
      entry.section.toLowerCase().includes(q),
  ).slice(0, 8);
}

export function DocsSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      debounceRef.current = window.setTimeout(() => {
        setResults([]);
        setOpen(false);
        setActiveIndex(-1);
      }, 0);
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      const found = searchIndex(query);
      setResults(found);
      setOpen(found.length > 0);
      setActiveIndex(-1);
    }, 150);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const navigateTo = (slug: string) => {
    setQuery("");
    setOpen(false);
    router.push(slug);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigateTo(results[activeIndex].slug);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-xs">
      <div className="relative flex items-center">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-controls="docs-search-results"
          aria-expanded={open}
          aria-label="Search documentation"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          onKeyDown={handleKeyDown}
          placeholder="Search docs…"
          role="combobox"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            aria-label="Clear search"
            className="absolute right-2 text-slate-400 hover:text-slate-600"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <ul
          className="absolute left-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          id="docs-search-results"
          role="listbox"
        >
          {results.map((entry, index) => (
            <li
              key={entry.slug}
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${index === activeIndex ? "bg-slate-50" : ""}`}
              role="option"
              onClick={() => navigateTo(entry.slug)}
            >
              <p className="font-medium text-slate-900">{highlight(entry.title, query)}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">{entry.section}</span>
                {entry.excerpt}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
