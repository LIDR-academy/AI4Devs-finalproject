import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './shared/components/ToastContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { HomePage } from './features/home/HomePage';
import { UserManagementPage } from './features/admin/UserManagementPage';
import { CourtListPage } from './features/courts/CourtListPage';
import { CourtAvailabilityPage } from './features/courts/CourtAvailabilityPage';
import { ReservationConfirmationPage } from './features/reservations/ReservationConfirmationPage';
import { MyReservationsPage } from './features/reservations/MyReservationsPage';
import { Navbar } from './shared/components/Navbar';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <div className="min-h-screen bg-gray-50">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />

                            {/* Court Routes (Public) */}
                            <Route path="/courts" element={<CourtListPage />} />
                            <Route path="/courts/:courtId/availability" element={<CourtAvailabilityPage />} />

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/reservations" element={<MyReservationsPage />} />
                                <Route path="/reservations/create" element={<ReservationConfirmationPage />} />
                            </Route>

                            {/* Admin Only Routes */}
                            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                                <Route path="/admin/users" element={<UserManagementPage />} />
                            </Route>
                        </Routes>
                    </div>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

