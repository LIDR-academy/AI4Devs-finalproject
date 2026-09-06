'use client';

import { useAuth } from '../hooks/useAuth';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      Cerrar sesión
    </button>
  );
}
