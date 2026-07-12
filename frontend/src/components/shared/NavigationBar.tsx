'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';

const AUTH_TOKEN_KEY = 'auth_token';

export function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Read auth on mount and on every route change; close the mobile menu on nav.
  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null);
    setMounted(true);
    setMenuOpen(false);
  }, [pathname]);

  const isAuthed = !!token;

  function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setMenuOpen(false);
    router.push('/');
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href) ? 'text-terracotta' : 'text-taupe hover:text-ink'
    }`;

  const authLinks = (onNavigate?: () => void) =>
    isAuthed ? (
      <>
        <Link
          href="/trips"
          onClick={onNavigate}
          data-testid="nav-trips"
          aria-current={isActive('/trips') ? 'page' : undefined}
          className={linkClass('/trips')}
        >
          My Trips
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          data-testid="nav-logout"
          className="text-left text-sm font-medium text-taupe hover:text-ink"
        >
          Log out
        </button>
      </>
    ) : (
      <>
        <Link
          href="/login"
          onClick={onNavigate}
          data-testid="nav-login"
          aria-current={isActive('/login') ? 'page' : undefined}
          className={linkClass('/login')}
        >
          Log in
        </Link>
        <Link
          href="/register"
          onClick={onNavigate}
          data-testid="nav-register"
          className="rounded-pill bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Sign up
        </Link>
      </>
    );

  return (
    <nav
      data-testid="navigation-bar"
      className="sticky top-0 z-40 border-b border-border bg-surface"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" data-testid="nav-home" className="font-serif text-xl text-ink tracking-[0.12em] uppercase">
            StayHub
          </Link>
          <Link
            href="/"
            data-testid="nav-search"
            aria-label="Search"
            className="flex items-center gap-1 text-sm text-taupe hover:text-ink"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Search</span>
          </Link>
        </div>

        {mounted && (
          <div className="hidden items-center gap-5 md:flex">{authLinks()}</div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="text-taupe hover:text-ink md:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mounted && menuOpen && (
        <div
          data-testid="nav-mobile-menu"
          className="flex flex-col items-start gap-3 border-t border-border px-4 py-3 md:hidden"
        >
          {authLinks(() => setMenuOpen(false))}
        </div>
      )}
    </nav>
  );
}
