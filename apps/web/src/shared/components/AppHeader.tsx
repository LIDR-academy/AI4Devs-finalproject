'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { cn } from '@/shared/lib/cn';

type AppHeaderProps = {
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
  maxWidthClassName?: string;
};

export function AppHeader({
  menuOpen = false,
  onMenuToggle,
  menuButtonRef,
  maxWidthClassName = 'max-w-5xl',
}: AppHeaderProps = {}) {
  const { user } = useAuth();
  const showMenuButton = Boolean(onMenuToggle && user);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div
        className={cn(
          'mx-auto flex items-center justify-between gap-3 px-4 py-4 md:px-6',
          maxWidthClassName,
        )}
      >
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900">MecaTrack</p>
          {user && (
            <p className="truncate text-sm text-slate-600">{user.fullName}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showMenuButton && (
            <button
              ref={menuButtonRef as React.Ref<HTMLButtonElement>}
              type="button"
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              onClick={onMenuToggle}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
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
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
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
