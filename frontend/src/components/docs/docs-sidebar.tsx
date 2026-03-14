"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  children?: NavItem[];
};

const NAV: NavItem[] = [
  { href: "/docs", label: "Overview" },
  {
    href: "/docs/getting-started",
    label: "Getting Started",
    children: [
      { href: "/docs/getting-started#quick-start", label: "Quick Start" },
      { href: "/docs/getting-started#registration", label: "Registration" },
      { href: "/docs/getting-started#first-upload", label: "First Upload" },
      { href: "/docs/getting-started#api-key", label: "API Key" },
    ],
  },
  {
    href: "/docs/authentication",
    label: "Authentication",
    children: [
      { href: "/docs/authentication#api-key-header", label: "API Key Header" },
      { href: "/docs/authentication#security", label: "Security" },
    ],
  },
  {
    href: "/docs/api-reference",
    label: "API Reference",
    children: [
      { href: "/docs/api-reference#users", label: "User Endpoints" },
      { href: "/docs/api-reference#files", label: "File Endpoints" },
      { href: "/docs/api-reference#error-codes", label: "Error Codes" },
    ],
  },
  {
    href: "/docs/code-examples",
    label: "Code Examples",
    children: [
      { href: "/docs/code-examples#curl", label: "cURL" },
      { href: "/docs/code-examples#python", label: "Python" },
      { href: "/docs/code-examples#javascript", label: "JavaScript" },
    ],
  },
  { href: "/docs/faq", label: "FAQ" },
];

function NavTree({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <NavTreeItem item={item} key={item.href} pathname={pathname} />
      ))}
    </ul>
  );
}

function NavTreeItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const [expanded, setExpanded] = useState(isActive);

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={item.href}
          className={cn(
            "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          {item.label}
        </Link>
        {item.children && (
          <button
            aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
            className="ml-1 rounded p-1 text-slate-400 hover:text-slate-700"
            onClick={() => setExpanded((v) => !v)}
            type="button"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {item.children && expanded && (
        <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-slate-200 pl-3">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="block rounded px-2 py-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <nav aria-label="Documentation navigation">
      <div className="mb-4 flex items-center gap-2 text-slate-900">
        <BookOpen className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">Docs</span>
      </div>
      <NavTree items={NAV} pathname={pathname ?? ""} />
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        aria-label="Open documentation navigation"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm xl:hidden"
        onClick={() => setMobileOpen(true)}
        type="button"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Documentation</span>
              <button
                aria-label="Close navigation"
                className="rounded p-1 hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-24">{sidebar}</div>
      </aside>
    </>
  );
}
