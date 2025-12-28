import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LandingPage from '../pages/LandingPage';
import ProfileMenu from '../components/ProfileMenu';
import * as AuthContextModule from '../contexts/AuthContext';

// Mock the API and QueryClient
vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQueryClient: () => ({
            invalidateQueries: vi.fn(),
            setQueryData: vi.fn(),
        }),
        useQuery: vi.fn(),
    };
});

// Mock AuthContext to control auth state easily in tests
const MockAuthProvider = ({ children, isAuthenticated, isAuthReady, user }) => {
    const value = {
        isAuthenticated,
        isAuthReady,
        user,
        login: vi.fn(),
        logout: vi.fn(),
    };
    return (
        <AuthContextModule.AuthContext.Provider value={value}>
            {children}
        </AuthContextModule.AuthContext.Provider>
    );
};

describe('Auth UI Logic', () => {

    it('LandingPage shows Login/Register when unauthenticated', async () => {
        render(
            <MockAuthProvider isAuthenticated={false} isAuthReady={true}>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </MockAuthProvider>
        );

        const loginLinks = screen.getAllByText(/ورود/i, { selector: 'a' });
        expect(loginLinks.length).toBeGreaterThan(0);

        // Also check for register button
        const registerLinks = screen.getAllByText(/ثبت نام/i, { selector: 'a' });
        expect(registerLinks.length).toBeGreaterThan(0);
        expect(screen.queryByText('داشبورد')).not.toBeInTheDocument();
    });

    it('LandingPage shows Dashboard/Profile when authenticated', async () => {
        const user = { first_name: 'Test', phone_number: '09123456789' };
        render(
            <MockAuthProvider isAuthenticated={true} isAuthReady={true} user={user}>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </MockAuthProvider>
        );

        expect(screen.queryByText('ورود')).not.toBeInTheDocument();
        // Dashboard link is visible
        expect(screen.getByText('داشبورد')).toBeInTheDocument();
        // Profile menu (Avatar) is visible - check for initials "T"
        // ProfileMenu uses displayName[0]. 
        expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('LandingPage shows skeleton loading when auth not ready', async () => {
        render(
            <MockAuthProvider isAuthenticated={false} isAuthReady={false}>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </MockAuthProvider>
        );

        // Expect skeleton class or specific element
        // In LandingPage: <div className="h-10 w-24 bg-slate-100 rounded-lg animate-pulse" />
        // We can inspect by class logic or just ensure no text.
        expect(screen.queryByText('ورود')).not.toBeInTheDocument();
        expect(screen.queryByText('داشبورد')).not.toBeInTheDocument();
    });
});
