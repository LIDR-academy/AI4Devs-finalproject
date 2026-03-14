'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';

const SUPPORTED_LOCALES = new Set(['es', 'en']);

function swapLocale(pathname: string, locale: string) {
  const parts = pathname.split('/');
  if (parts.length > 1 && SUPPORTED_LOCALES.has(parts[1])) {
    parts[1] = locale;
    return parts.join('/');
  }
  return `/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('appShell');
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const currentLocale = pathname.split('/')[1];
  const locale = SUPPORTED_LOCALES.has(currentLocale) ? currentLocale : 'es';
  const localizedIndexPath = `/${locale}`;

  useEffect(() => {
    if (user?.role === 'doctor' && pathname === localizedIndexPath) {
      router.replace(`/${locale}/doctors/profile`);
    }
  }, [locale, localizedIndexPath, pathname, router, user?.role]);

  const navLinks = user
    ? user.role === 'admin'
      ? [{ href: `/${locale}/admin/dashboard`, label: t('nav.adminDashboard') }]
      : user.role === 'doctor'
        ? [
            { href: `/${locale}/doctors/profile`, label: t('nav.doctorProfile') },
            { href: `/${locale}/doctors/schedules`, label: t('nav.doctorSchedules') },
            { href: `/${locale}/doctors/verification`, label: t('nav.doctorVerification') },
          ]
        : [
            { href: `/${locale}/search`, label: t('nav.searchDoctors') },
            { href: `/${locale}/appointments`, label: t('nav.myAppointments') },
          ]
    : [
        { href: `/${locale}/login`, label: t('nav.login') },
        { href: `/${locale}/register`, label: t('nav.registerPatient') },
        { href: `/${locale}/register/doctor`, label: t('nav.registerDoctor') },
      ];

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-slate-900"
      >
        {t('skipToContent')}
      </a>
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`} className="text-xl font-semibold text-brand-700">
            CitaYa
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-md px-2 py-1 text-sm ${
                locale === 'es' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => router.push(swapLocale(pathname, 'es'))}
            >
              ES
            </button>
            <button
              type="button"
              className={`rounded-md px-2 py-1 text-sm ${
                locale === 'en' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => router.push(swapLocale(pathname, 'en'))}
            >
              EN
            </button>
            {user && (
              <button
                type="button"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  logout();
                  router.push(`/${locale}/login`);
                }}
              >
                {t('logout')}
              </button>
            )}
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 sm:px-6 md:hidden">
          <nav
            aria-label={t('mobileNavLabel')}
            className="flex gap-2 overflow-x-auto"
          >
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.href}`}
                href={link.href}
                className="whitespace-nowrap rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>{t('footer.rights')}</p>
          <p>{t('footer.market')}</p>
        </div>
      </footer>
    </div>
  );
}
