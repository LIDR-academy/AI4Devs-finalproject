/**
 * AuthGuard
 *
 * Route guard for protected routes.
 * If the user has no active session, redirects to /login.
 * Otherwise renders the matched child route via <Outlet />.
 *
 * Usage in App.tsx:
 *   <Route element={<AuthGuard />}>
 *     <Route path="/" element={<MeditationBuilderPage />} />
 *     <Route path="/library" element={<MeditationLibraryPage />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@state/authStore';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

export function AuthGuard() {
  const session = useAuthStore((state) => state.session);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <AppHeader />
      <main className="app__main">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
