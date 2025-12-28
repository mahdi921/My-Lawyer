import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, isAuthReady } = useAuth();

    // Show loading state while validating
    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">در حال بررسی احراز هویت...</p>
                </div>
            </div>
        );
    }

    // If no user, redirect
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Token is valid, render protected content
    return <Outlet />;
}
