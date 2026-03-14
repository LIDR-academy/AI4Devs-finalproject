/**
 * App Component
 *
 * Root component with React Router + Google OAuth setup.
 *
 * Routes:
 * - /login          : LoginPage       (public — outside AuthGuard)
 * - /               : MeditationBuilderPage (protected via AuthGuard)
 * - /library        : MeditationLibraryPage (protected via AuthGuard)
 *
 * Auth guard redirects unauthenticated users to /login.
 * GoogleOAuthProvider wraps the whole tree so @react-oauth/google hooks work anywhere.
 *
 * Required env var: VITE_GOOGLE_CLIENT_ID
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MeditationBuilderPage } from './pages/MeditationBuilderPage';
import { MeditationLibraryPage } from './pages/MeditationLibraryPage';
import { LoginPage } from './pages/LoginPage';
import { AuthGuard } from './components/AuthGuard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// React Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes — AuthGuard handles redirect + nav */}
            <Route element={<AuthGuard />}>
              <Route path="/" element={<MeditationBuilderPage />} />
              <Route path="/library" element={<MeditationLibraryPage />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
