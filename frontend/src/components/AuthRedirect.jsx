import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthRedirect wraps login/register pages and redirects to dashboard if already logged in.
 */
export default function AuthRedirect({ children }) {
    const { isAuthenticated, isAuthReady } = useAuth();

    // Prevent flicker: don't redirect until we know auth state
    if (!isAuthReady) {
        return null; // or a spinner
    }

    if (isAuthenticated) {
        // User is already logged in, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Not logged in, show the auth page
    return children;
}
