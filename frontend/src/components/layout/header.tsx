import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

const NAV = [
  { href: "/upload", label: "Upload" },
  { href: "/retrieve", label: "Retrieve" },
  { href: "/files", label: "Files" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="text-base font-bold tracking-tight text-slate-900" href="/">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          {NAV.map((item) => (
            <Link className="transition hover:text-slate-900" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="font-semibold text-emerald-700" href="/login">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
