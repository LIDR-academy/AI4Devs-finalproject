/**
 * App Component
 * 
 * Root component with React Router setup.
 * 
 * Routes:
 * - / : MeditationBuilderPage (US2 - Create meditation)
 * - /library : MeditationLibraryPage (US4 - List and play meditations)
 */

import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MeditationBuilderPage } from './pages/MeditationBuilderPage';
import { MeditationLibraryPage } from './pages/MeditationLibraryPage';

// React Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          {/* Navigation */}
          <nav className="app-nav">
            <ul>
              <li>
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-active' : ''}>
                  Crear Meditación
                </NavLink>
              </li>
              <li>
                <NavLink to="/library" className={({ isActive }) => isActive ? 'nav-active' : ''}>
                  Biblioteca
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<MeditationBuilderPage />} />
            <Route path="/library" element={<MeditationLibraryPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
