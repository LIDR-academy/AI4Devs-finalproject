'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">MecaTrack</p>
          {user && (
            <p className="text-sm text-slate-600">{user.fullName}</p>
          )}
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
