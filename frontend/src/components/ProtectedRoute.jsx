import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api';

export default function ProtectedRoute() {
    const token = localStorage.getItem('access_token');

    // If no token at all, redirect immediately
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Validate token by fetching current user
    const { isLoading, isError } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const res = await api.get('/users/me/');
            return res.data;
        },
        retry: false, // Don't retry on 401
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Show loading state while validating
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">در حال بررسی احراز هویت...</p>
                </div>
            </div>
        );
    }

    // If token is invalid/expired, clear it and redirect
    if (isError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return <Navigate to="/login" replace />;
    }

    // Token is valid, render protected content
    return <Outlet />;
}
