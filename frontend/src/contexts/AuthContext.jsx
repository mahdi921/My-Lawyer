import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    // Initialize token from localStorage, but keep it in state for reactivity
    const [token, setToken] = useState(() => localStorage.getItem('access_token'));

    // We rely on the useQuery hook to validate the token and fetch user
    const { data: user, isLoading, isError, error } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            if (!token) return null;
            const res = await api.get('/users/me/');
            return res.data;
        },
        retry: false,
        enabled: !!token, // Only run if token exists
        staleTime: 5 * 60 * 1000,
    });

    // Derived state
    const isAuthenticated = !!user;

    // Auth is ready when:
    // 1. No token -> ready (anonymous)
    // 2. Token exists -> ready when query is not loading
    const isAuthReady = !token || !isLoading;

    const login = (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setToken(accessToken); // Update state to trigger re-render and query
        // Invalidate query to trigger refetch (optional if key invalidation is needed for fresh data)
        queryClient.invalidateQueries(['currentUser']);
    };

    const logout = async () => {
        try {
            // Optional: call backend logout
            // await api.post('/users/logout/'); 
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setToken(null);
            queryClient.setQueryData(['currentUser'], null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAuthReady, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
