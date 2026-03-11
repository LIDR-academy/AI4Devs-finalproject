import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import HealthCheck from './components/HealthCheck'
import Layout from './components/layout/Layout'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ComparisonDetailsPage from './pages/comparisons/ComparisonDetailsPage'
import ComparisonResultsPage from './pages/comparisons/ComparisonResultsPage'
import ComparisonsPage from './pages/comparisons/ComparisonsPage'
import CreateComparisonPage from './pages/comparisons/CreateComparisonPage'
import SavedComparisonPage from './pages/comparisons/SavedComparisonPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import TemplateAnalyzePage from './pages/TemplateAnalyzePage'
import TemplateCreatedPage from './pages/templates/TemplateCreatedPage'
import TemplateDetailsPage from './pages/templates/TemplateDetailsPage'
import TemplatesPage from './pages/templates/TemplatesPage'
import TemplateUploadPage from './pages/templates/TemplateUploadPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Health check endpoint - public and simple */}
              <Route path="/health" element={<HealthCheck />} />
              
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes with layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard */}
                <Route index element={<HomePage />} />
                
                {/* Template Analysis - Now integrated with navigation */}
                <Route path="analyze" element={<TemplateAnalyzePage />} />
                
                {/* Templates */}
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="templates/upload" element={<TemplateUploadPage />} />
                <Route path="templates/created/:versionId" element={<TemplateCreatedPage />} />
                <Route path="templates/versions/:versionId" element={<TemplateCreatedPage />} />
                <Route path="templates/:id" element={<TemplateDetailsPage />} />
                
                {/* Comparisons */}
                <Route path="comparisons" element={<ComparisonsPage />} />
                <Route path="comparisons/create" element={<CreateComparisonPage />} />
                <Route path="comparisons/results" element={<ComparisonResultsPage />} />
                <Route path="comparisons/results/:comparisonId" element={<SavedComparisonPage />} />
                <Route path="comparisons/:id" element={<ComparisonDetailsPage />} />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
              
              {/* 404 page for non-protected routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App