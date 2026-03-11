"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/retrieve", label: "Retrieve" },
  { href: "/files", label: "Files" },
  { href: "/docs", label: "Docs" },
  { href: "/login", label: "Login/Register" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="text-base font-bold tracking-tight text-slate-900" href="/">
          {APP_NAME}
        </Link>

        <button
          aria-controls="mobile-nav"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <nav className="hidden items-center gap-2 text-sm text-slate-600 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              className={cn(
                "rounded-md px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                isActive(item.href) ? "bg-emerald-100 font-semibold text-emerald-800" : "hover:bg-slate-100 hover:text-slate-900",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <nav
        aria-label="Mobile primary"
        className={cn("border-t border-slate-200 bg-white px-4 py-3 md:hidden", mobileOpen ? "block" : "hidden")}
        id="mobile-nav"
      >
        <div className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              className={cn(
                "rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                isActive(item.href) ? "bg-emerald-100 font-semibold text-emerald-800" : "text-slate-700 hover:bg-slate-100",
              )}
              href={item.href}
              key={`mobile-${item.href}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
