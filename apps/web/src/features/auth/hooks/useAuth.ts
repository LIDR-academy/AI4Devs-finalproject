'use client';

import { useAuthContext } from '../context/AuthProvider';

export function useAuth() {
  return useAuthContext();
}
