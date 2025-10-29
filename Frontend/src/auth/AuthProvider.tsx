import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getKeycloak } from './keycloak';
import { env } from '../env';

type AuthContextType = {
  initialized: boolean;
  authenticated: boolean;
  token?: string;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  initialized: false,
  authenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const initStartedRef = React.useRef(false);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initStartedRef.current) {
      return;
    }
    initStartedRef.current = true;

    // Bypass auth: treat as authenticated for UI/tests when enabled
    if (env.authDisabled) {
      setInitialized(true);
      setAuthenticated(true);
      setToken(undefined);
      return;
    }

    let refreshHandle: number | undefined;
    const keycloak = getKeycloak();
    if (!keycloak) {
      // No OIDC config available in env (e.g., tests). Mark as initialized but not authenticated.
      setInitialized(true);
      setAuthenticated(false);
      setToken(undefined);
      return;
    }

    // Check if already initialized
    if (keycloak.authenticated !== undefined) {
      setInitialized(true);
      setAuthenticated(keycloak.authenticated);
      setToken(keycloak.token ?? undefined);
      return;
    }

    // Determine initialization strategy based on current path
    // If we're on /callback, we need to process the authorization code
    const isCallback = window.location.pathname === '/callback';
    const hasAuthCode = window.location.search.includes('code=');
    
    keycloak
      .init({
        // Use 'login-required' when on callback to process the authorization code
        // Use 'check-sso' otherwise to check for existing session
        onLoad: isCallback && hasAuthCode ? 'login-required' : 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      })
      .then((auth) => {
        setInitialized(true);
        setAuthenticated(!!auth);
        setToken(keycloak.token ?? undefined);
        if (auth) {
          const schedule = async () => {
            const refreshed = await keycloak.updateToken(60).catch(() => false);
            if (refreshed) setToken(keycloak.token ?? undefined);
          };
          refreshHandle = window.setInterval(schedule, 30000);
        }
      })
      .catch((err) => {
        console.error('Keycloak init error:', err);
        setInitialized(true);
      });

    return () => {
      if (refreshHandle) window.clearInterval(refreshHandle);
    };
  }, []);

  const value = useMemo(
    () => ({
      initialized,
      authenticated,
      token,
      login: () => {
        const kc = getKeycloak();
        if (kc) {
          const redirectUri = env.oidcRedirectUri || window.location.origin;
          kc.login({ redirectUri });
        }
      },
      logout: () => {
        if (env.authDisabled) {
          setAuthenticated(false);
          setToken(undefined);
          return;
        }
        const kc = getKeycloak();
        if (kc) kc.logout({ redirectUri: window.location.origin });
      },
    }),
    [initialized, authenticated, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

