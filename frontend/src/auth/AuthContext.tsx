import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authService, type MeResponse } from "../services/authService";
import { setAuthTokenProvider, setUnauthorizedHandler } from "../services/httpClient";

const REFRESH_TOKEN_KEY = "eyemaster.refreshToken";

type AuthState = {
   user: MeResponse | null;
   isLoading: boolean;
   isAuthenticated: boolean;
   login: (email: string, password: string) => Promise<void>;
   logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
   const [accessToken, setAccessToken] = useState<string | null>(null);
   const [user, setUser] = useState<MeResponse | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      setAuthTokenProvider(() => accessToken);
   }, [accessToken]);

   const loadProfile = useCallback(async () => {
      const profile = await authService.me();
      setUser(profile);
   }, []);

   useEffect(() => {
      const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefresh) {
         setIsLoading(false);
         return;
      }

      authService
         .refresh(storedRefresh)
         .then(({ access }) => {
            setAccessToken(access);
         })
         .catch(() => {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
         })
         .finally(() => setIsLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      if (accessToken) {
         loadProfile().catch(() => setUser(null));
      }
   }, [accessToken, loadProfile]);

   const login = useCallback(async (email: string, password: string) => {
      const { access, refresh } = await authService.login(email, password);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      setAccessToken(access);
   }, []);

   const logout = useCallback(() => {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setAccessToken(null);
      setUser(null);
   }, []);

   useEffect(() => {
      setUnauthorizedHandler(async () => {
         const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
         if (!storedRefresh) {
            logout();
            return null;
         }
         try {
            const { access } = await authService.refresh(storedRefresh);
            setAccessToken(access);
            return access;
         } catch {
            logout();
            return null;
         }
      });
      return () => setUnauthorizedHandler(null);
   }, [logout]);

   const value = useMemo<AuthState>(
      () => ({
         user,
         isLoading,
         isAuthenticated: Boolean(accessToken && user),
         login,
         logout,
      }),
      [user, isLoading, accessToken, login, logout],
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
}
