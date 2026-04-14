import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Guard: redirect to /login if not authenticated.
 * Also wraps all protected pages with SocketProvider so
 * the single socket lives as long as the user is logged in.
 */
const ProtectedLayout = () => {
    const { isAuthenticated, token } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return (
        <SocketProvider token={token}>
            <AppLayout />
        </SocketProvider>
    );
};

/** Guard: redirect to /dashboard if already logged in. */
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            {/* Protected — all share AppLayout + SocketProvider */}
            <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/alerts"    element={<AlertsPage />} />
                <Route path="/settings"  element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
