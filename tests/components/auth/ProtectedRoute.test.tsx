import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useLocation } from 'react-router-dom';
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute';
import { useAuth } from '../../../src/contexts/AuthContext';

// Mock dependencies
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Navigate to capture redirect calls
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, state, replace }: any) => {
    mockNavigate({ to, state, replace });
    return <div data-testid="navigate-mock">Redirecting to {to}</div>;
  },
  useLocation: jest.fn(),
}));

describe('ProtectedRoute', () => {
  const TestChild = () => <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    // Default location
    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/search',
      search: '',
      hash: '',
      state: null,
      key: 'test-key',
    });
  });

  describe('FR-010: Unauthenticated User Redirect', () => {
    it('should redirect to /sign-in when user is not authenticated', () => {
      // Arrange: User not authenticated
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Redirected to sign in
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringContaining('/sign-in'),
        })
      );
    });

    it('should NOT render children when user is not authenticated', () => {
      // Arrange: User not authenticated
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Children not rendered
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('FR-047: Return URL Preservation with Dual Mechanism', () => {
    it('should set return URL in location state when redirecting unauthenticated user', () => {
      // Arrange: User not authenticated, accessing /search
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      (useLocation as jest.Mock).mockReturnValue({
        pathname: '/search',
        search: '',
        hash: '',
        state: null,
        key: 'test-key',
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Return URL in state per FR-047 primary mechanism
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            returnUrl: '/search',
          }),
        })
      );
    });

    it('should include return URL in query parameter when redirecting (FR-047 fallback)', () => {
      // Arrange: User not authenticated, accessing /smart-search
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      (useLocation as jest.Mock).mockReturnValue({
        pathname: '/smart-search',
        search: '',
        hash: '',
        state: null,
        key: 'test-key',
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Return URL in query parameter (encoded)
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringMatching(/\/sign-in\?returnUrl=/),
        })
      );
    });

    it('should preserve complex paths with query parameters in return URL', () => {
      // Arrange: User accessing /search with filters
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      (useLocation as jest.Mock).mockReturnValue({
        pathname: '/search',
        search: '?filter=apartment&location=sydney',
        hash: '',
        state: null,
        key: 'test-key',
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Full path with query params preserved
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            returnUrl: '/search?filter=apartment&location=sydney',
          }),
        })
      );
    });
  });

  describe('FR-022: Email Verification Check', () => {
    it('should redirect to /verify-email when user email is not verified', () => {
      // Arrange: Authenticated but email not verified
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          email_confirmed_at: null, // Email not verified
        },
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Redirected to verify email page
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/verify-email',
        })
      );
    });

    it('should NOT render children when email is not verified', () => {
      // Arrange: Authenticated but email not verified
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          email_confirmed_at: null,
        },
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Children not rendered
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render children when email is verified (has confirmed_at timestamp)', () => {
      // Arrange: Authenticated with verified email
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          email_confirmed_at: '2025-01-15T12:00:00Z', // Email verified
        },
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Children rendered
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('FR-010: Successful Access When Authenticated and Verified', () => {
    it('should render children when user is authenticated with verified email', () => {
      // Arrange: Fully authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'verified@example.com',
          email_confirmed_at: '2025-01-15T12:00:00Z',
        },
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Children rendered, no redirect
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should NOT redirect when access is granted', () => {
      // Arrange: Fully authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'verified@example.com',
          email_confirmed_at: '2025-01-15T12:00:00Z',
        },
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: No navigation calls
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Loading State Handling', () => {
    it('should show loading state while checking authentication', () => {
      // Arrange: Auth still loading
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Loading indicator shown, children not rendered
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should NOT redirect while authentication is loading', () => {
      // Arrange: Auth still loading
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: No redirect during loading
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Replace Flag for Navigation', () => {
    it('should use replace=true to prevent back button issues', () => {
      // Arrange: Unauthenticated user
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: replace flag set per React Router best practices
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          replace: true,
        })
      );
    });

    it('should use replace=true for email verification redirect', () => {
      // Arrange: Authenticated but email not verified
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          email_confirmed_at: null,
        },
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: replace flag set
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          replace: true,
        })
      );
    });
  });

  describe('FR-025: Protected Routes Coverage', () => {
    it('should work for /search route', () => {
      // Arrange
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '123', email: 'test@example.com', email_confirmed_at: '2025-01-15T12:00:00Z' },
      });
      (useLocation as jest.Mock).mockReturnValue({
        pathname: '/search',
        search: '',
        hash: '',
        state: null,
        key: 'test-key',
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Access granted
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should work for /smart-search route', () => {
      // Arrange
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '123', email: 'test@example.com', email_confirmed_at: '2025-01-15T12:00:00Z' },
      });
      (useLocation as jest.Mock).mockReturnValue({
        pathname: '/smart-search',
        search: '',
        hash: '',
        state: null,
        key: 'test-key',
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Access granted
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should work for /chat route', () => {
      // Arrange
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '123', email: 'test@example.com', email_confirmed_at: '2025-01-15T12:00:00Z' },
      });
      (useLocation as jest.Mock).mockReturnValue({
        pathname: '/chat',
        search: '',
        hash: '',
        state: null,
        key: 'test-key',
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Access granted
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user object without email_confirmed_at field (treat as unverified)', () => {
      // Arrange: User object missing email_confirmed_at
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '123',
          email: 'test@example.com',
          // email_confirmed_at missing
        },
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Redirected to verify email
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/verify-email',
        })
      );
    });

    it('should handle undefined user when authenticated=true (edge case)', () => {
      // Arrange: Authenticated but no user object (shouldn't happen, but handle gracefully)
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: null,
      });

      // Act
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Assert: Should redirect to verify email (safe fallback)
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/verify-email',
        })
      );
    });
  });
});
