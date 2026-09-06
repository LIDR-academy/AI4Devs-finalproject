'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import type { NavItem } from './nav-items';

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  ariaLabel: string;
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
};

export function MobileNavDrawer({
  open,
  onClose,
  items,
  ariaLabel,
  returnFocusRef,
}: MobileNavDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    const focusTarget = returnFocusRef?.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      focusTarget?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 md:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 transition-opacity duration-200"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="absolute inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-white shadow-lg transition-transform duration-200"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">{ariaLabel}</p>
          <button
            type="button"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label={ariaLabel} className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'rounded-md border-l-4 px-3 py-3 text-sm font-medium transition',
                  isActive
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
