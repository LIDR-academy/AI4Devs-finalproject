import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { env } from '../env';

export const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (env.authDisabled) {
    return <>{children}</>;
  }
  const { initialized, authenticated, login } = useAuth();
  const location = useLocation();
  const loginTriggeredRef = useRef(false);

  useEffect(() => {
    // Only trigger login once when not authenticated
    if (initialized && !authenticated && !loginTriggeredRef.current) {
      loginTriggeredRef.current = true;
      login();
    }
  }, [initialized, authenticated, login]);

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  if (!authenticated) {
    return null;
  }
  
  return <>{children}</>;
};

