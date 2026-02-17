import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './shared/components/ToastContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { HomePage } from './features/home/HomePage';
import { UserManagementPage } from './features/admin/UserManagementPage';
import { CourtManagementPage } from './features/admin/CourtManagementPage';
import { ReservationsManagementPage } from './features/admin/ReservationsManagementPage';
import { CourtListPage } from './features/courts/CourtListPage';
import { CourtAvailabilityPage } from './features/courts/CourtAvailabilityPage';
import { ReservationConfirmationPage } from './features/reservations/ReservationConfirmationPage';
import { MyReservationsPage } from './features/reservations/MyReservationsPage';
import { PaymentInitiationPage } from './features/payments/PaymentInitiationPage';
import { MockPaymentGatewayPage } from './features/payments/MockPaymentGatewayPage';
import { PaymentConfirmationPage } from './features/payments/PaymentConfirmationPage';
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

                            {/* Mock Payment Gateway (Public - simulates external service) */}
                            <Route path="/mock-payment-gateway" element={<MockPaymentGatewayPage />} />

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/reservations" element={<MyReservationsPage />} />
                                <Route path="/reservations/create" element={<ReservationConfirmationPage />} />
                                <Route path="/payments/initiate/:reservationId" element={<PaymentInitiationPage />} />
                                <Route path="/payments/:paymentId/confirm" element={<PaymentConfirmationPage />} />
                            </Route>

                            {/* Admin Only Routes */}
                            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                                <Route path="/admin/users" element={<UserManagementPage />} />
                                <Route path="/admin/courts" element={<CourtManagementPage />} />
                                <Route path="/admin/reservations" element={<ReservationsManagementPage />} />
                            </Route>
                        </Routes>
                    </div>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

