import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '../api';

// Mock API
vi.mock('../api', () => ({
    default: {
        get: vi.fn(),
    },
}));

const TestComponent = () => {
    const { isAuthenticated, login, user } = useAuth();
    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            {user && <div data-testid="user-name">{user.first_name}</div>}
            <button onClick={() => login('fake-token', 'fake-refresh')}>Login</button>
        </div>
    );
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );
};

describe('AuthContext Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('login updates authentication state', async () => {
        api.get.mockResolvedValue({ data: { first_name: 'TestUser' } });

        render(<TestComponent />, { wrapper: createWrapper() });

        // Initially not authenticated
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

        // Click login
        await act(async () => {
            screen.getByText('Login').click();
        });

        // Should update localStorage
        expect(localStorage.getItem('access_token')).toBe('fake-token');

        // Should eventually become authenticated
        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        });

        expect(screen.getByTestId('user-name')).toHaveTextContent('TestUser');
    });
});
