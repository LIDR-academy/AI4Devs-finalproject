'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import type { LoginFormValues } from '../utils/loginSchema';
import { mapAuthError } from '../utils/mapAuthError';

export function useLogin() {
  const { login } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLogin = async (values: LoginFormValues) => {
    setIsPending(true);
    setError(null);

    try {
      await login({
        email: values.email.toLowerCase(),
        password: values.password,
      });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setIsPending(false);
    }
  };

  return { login: submitLogin, isPending, error, setError };
}
