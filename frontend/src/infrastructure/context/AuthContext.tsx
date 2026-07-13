import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import type { AuthResponse, AuthState, LoginRequest, User } from "@/domain/types/auth";
import { useLogin, useRefreshToken } from "@/infrastructure/hooks/useAuth";

type AuthAction =
  | { type: "LOGIN"; payload: { user: User; accessToken: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESTORE_SESSION"; payload: { user: User; accessToken: string } };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESTORE_SESSION":
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const loginMutation = useLogin();
  const refreshMutation = useRefreshToken();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !storedRefreshToken) {
      dispatch({ type: "SET_LOADING", payload: false });
      return;
    }

    refreshMutation.mutate(storedRefreshToken, {
      onSuccess: (data: AuthResponse) => {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        dispatch({
          type: "RESTORE_SESSION",
          payload: { user: data.user, accessToken: data.accessToken },
        });
      },
      onError: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch({ type: "LOGOUT" });
      },
    });
  }, [refreshMutation.mutate]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const data = await loginMutation.mutateAsync(credentials);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      dispatch({
        type: "LOGIN",
        payload: { user: data.user, accessToken: data.accessToken },
      });
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
