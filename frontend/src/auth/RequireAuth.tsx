import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
   const { isAuthenticated, isLoading } = useAuth();

   if (isLoading) {
      return <p>Loading...</p>;
   }

   if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
   }

   return <AppLayout>{children}</AppLayout>;
}
