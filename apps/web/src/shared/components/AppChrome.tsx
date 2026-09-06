'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/cn';
import { AppHeader } from './AppHeader';
import { MobileNavDrawer } from './MobileNavDrawer';
import { RoleNav } from './RoleNav';
import {
  getNavAriaLabel,
  getNavItemsForRole,
  getShellMaxWidthClassName,
} from './nav-items';

type AppChromeProps = {
  children: React.ReactNode;
  maxWidthClassName?: string;
};

export function AppChrome({ children, maxWidthClassName }: AppChromeProps) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const maxWidth =
    maxWidthClassName ??
    (user ? getShellMaxWidthClassName(user.role) : 'max-w-5xl');

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const onChange = () => {
      if (mediaQuery.matches) {
        setMenuOpen(false);
      }
    };

    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const items = user ? getNavItemsForRole(user.role) : [];
  const ariaLabel = user ? getNavAriaLabel(user.role) : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        menuOpen={menuOpen}
        onMenuToggle={user ? toggleMenu : undefined}
        menuButtonRef={menuButtonRef}
        maxWidthClassName={maxWidth}
      />
      <RoleNav maxWidthClassName={maxWidth} />
      {user && (
        <MobileNavDrawer
          open={menuOpen}
          onClose={closeMenu}
          items={items}
          ariaLabel={ariaLabel}
          returnFocusRef={menuButtonRef}
        />
      )}
      <main className={cn('mx-auto px-4 py-8 md:px-6', maxWidth)}>
        {children}
      </main>
    </div>
  );
}
