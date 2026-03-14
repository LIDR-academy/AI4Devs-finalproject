"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("h2[id], h3[id]")) as HTMLElement[];
    const parsed: Heading[] = elements.map((el) => ({
      id: el.id,
      text: el.textContent ?? "",
      level: parseInt(el.tagName[1], 10),
    }));
      const rafId = window.requestAnimationFrame(() => {
        setHeadings(parsed);
      });

    if (parsed.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 },
    );

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      observerRef.current?.disconnect();
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="hidden xl:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">On this page</p>
      <ul className="space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && "pl-3")}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block truncate rounded px-2 py-0.5 text-slate-600 transition-colors hover:text-slate-900",
                activeId === heading.id && "font-medium text-emerald-700",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
