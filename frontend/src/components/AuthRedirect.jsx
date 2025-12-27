import { Navigate } from 'react-router-dom';

/**
 * AuthRedirect wraps login/register pages and redirects to dashboard if already logged in.
 */
export default function AuthRedirect({ children }) {
    const token = localStorage.getItem('access_token');

    if (token) {
        // User is already logged in, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Not logged in, show the auth page
    return children;
}
