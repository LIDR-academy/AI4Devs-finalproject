import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKeycloak } from '../auth/keycloak';
import { LoadingSpinner } from '../components/ui';

export default function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const kc = getKeycloak();
    if (!kc) {
      // No Keycloak configured, redirect to home
      navigate('/', { replace: true });
      return;
    }
    
    // Check if this is actually a callback with code/error
    const searchParams = new URLSearchParams(window.location.search);
    const hasCode = searchParams.has('code');
    const hasError = searchParams.has('error');
    
    if (!hasCode && !hasError) {
      // No callback params, just redirect
      navigate('/', { replace: true });
      return;
    }
    
    // Let Keycloak process the callback
    // The AuthProvider should handle the actual token exchange
    // We just need to wait a moment for it to complete
    const timer = setTimeout(() => {
      if (kc.authenticated) {
        navigate('/', { replace: true });
      } else if (hasError) {
        setError(searchParams.get('error_description') || 'Authentication failed');
      } else {
        // Still processing, give it more time
        const retryTimer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
        return () => clearTimeout(retryTimer);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 text-xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Completando inicio de sesión...</p>
    </div>
  );
}

