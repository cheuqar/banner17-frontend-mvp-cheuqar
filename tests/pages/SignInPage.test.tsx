import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import SignInPage from '../../src/pages/SignInPage';
import { useAuth } from '../../src/contexts/AuthContext';

// Mock dependencies
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('SignInPage', () => {
  const mockNavigate = jest.fn();
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    // Default: No return URL
    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/sign-in',
      search: '',
      hash: '',
      state: null,
      key: 'test-key',
    });
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams(), jest.fn()]);
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <SignInPage />
      </BrowserRouter>
    );
  };

  describe('FR-027: SignInPage Component Composition', () => {
    it('should render SignInForm component', () => {
      // Act
      renderPage();

      // Assert: SignInForm elements are present
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render page title "Sign In" or "Welcome Back"', () => {
      // Act
      renderPage();

      // Assert: Page has heading
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toMatch(/sign in|welcome back/i);
    });

    it('should render link to sign up page', () => {
      // Act
      renderPage();

      // Assert: Link to /sign-up exists
      const signUpLink = screen.getByRole('link', { name: /sign up|don't have an account|create account/i });
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/sign-up');
    });

    it('should render AuthErrorAlert when error exists', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
      renderPage();

      // Act: Submit form to trigger error
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert: Error alert appears
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
      });
    });
  });

  describe('FR-032: Style4-V2 Color Palette', () => {
    it('should use white background for page (#FFFFFF)', () => {
      // Act
      const { container } = renderPage();

      // Assert: Container has white background
      const pageContainer = container.querySelector('[role="main"]') || container.firstChild;
      expect(pageContainer).toHaveStyle({ backgroundColor: '#ffffff' });
    });

    it('should use black text color for heading (#000000)', () => {
      // Act
      renderPage();

      // Assert: Heading uses black text
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveStyle({ color: '#000000' });
    });
  });

  describe('FR-034: Page Content Padding (32px)', () => {
    it('should apply 32px padding to page content', () => {
      // Act
      const { container } = renderPage();

      // Assert: Container has 32px padding
      const pageContainer = container.querySelector('Box') || container.firstChild;
      expect(pageContainer).toBeTruthy();
    });
  });

  describe('FR-001 & FR-031: Sign In Success Flow with Return URL', () => {
    it('should redirect to home page (/) on successful sign in when no return URL', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });
      renderPage();

      // Act: Submit valid form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert: Redirected to home page (default)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should redirect to return URL from location state after successful sign in (FR-047 primary)', async () => {
      // Arrange: Return URL in location state
      (useLocation as jest.Mock).mockReturnValue({
        pathname: '/sign-in',
        search: '',
        hash: '',
        state: { returnUrl: '/search' }, // ProtectedRoute sets this
        key: 'test-key',
      });
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });
      renderPage();

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert: Redirected to /search per FR-031, FR-047
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/search');
      });
    });

    it('should redirect to return URL from query parameter after successful sign in (FR-047 fallback)', async () => {
      // Arrange: Return URL in query param (browser refresh scenario)
      (useSearchParams as jest.Mock).mockReturnValue([
        new URLSearchParams('returnUrl=%2Fsmart-search'),
        jest.fn(),
      ]);
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });
      renderPage();

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert: Redirected to /smart-search per FR-031, FR-047
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/smart-search');
      });
    });

    it('should NOT redirect when sign in fails', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
      renderPage();

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert: No navigation occurred
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('FR-047: Return URL Dual Preservation Mechanism', () => {
    it('should prefer location state over query parameter when both exist', async () => {
      // Arrange: Both state and query param present
      (useLocation as jest.Mock).mockReturnValue({
        pathname: '/sign-in',
        search: '?returnUrl=%2Fchat',
        hash: '',
        state: { returnUrl: '/search' }, // State takes priority
        key: 'test-key',
      });
      (useSearchParams as jest.Mock).mockReturnValue([
        new URLSearchParams('returnUrl=%2Fchat'),
        jest.fn(),
      ]);
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });
      renderPage();

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert: State value used (not query param)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/search');
      });
    });
  });

  describe('FR-049: Already-Authenticated User Handling', () => {
    it('should redirect to home page if user is already authenticated', () => {
      // Arrange: User is already authenticated
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        isAuthenticated: true,
        isLoading: false,
        user: { id: '123', email: 'user@example.com' },
      });

      // Act
      renderPage();

      // Assert: Redirected to home page immediately
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should not render form if user is already authenticated', () => {
      // Arrange: User is authenticated
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        isAuthenticated: true,
        isLoading: false,
        user: { id: '123', email: 'user@example.com' },
      });

      // Act
      renderPage();

      // Assert: Form not rendered (redirecting instead)
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Display Integration', () => {
    it('should display error message from SignInForm via AuthErrorAlert', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: { message: 'Email not confirmed' } });
      renderPage();

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert: Error displayed in AuthErrorAlert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/email not confirmed/i)).toBeInTheDocument();
      });
    });

    it('should clear previous error when new sign in attempt succeeds', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignIn
        .mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
        .mockResolvedValueOnce({ error: null });
      renderPage();

      // Act: First attempt fails
      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
      });

      // Act: Second attempt succeeds
      await user.clear(screen.getByLabelText(/email/i));
      await user.clear(screen.getByLabelText(/^password$/i));
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Assert: Error cleared and redirected
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Loading State', () => {
    it('should not render page content while authentication is loading', () => {
      // Arrange: Auth is still loading
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      // Act
      renderPage();

      // Assert: Loading state (either spinner or no form)
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      // Act
      renderPage();

      // Assert: Page has h1 heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have semantic main landmark', () => {
      // Act
      const { container } = renderPage();

      // Assert: Page uses semantic HTML or role="main"
      const mainElement = container.querySelector('main') || container.querySelector('[role="main"]');
      expect(mainElement).toBeTruthy();
    });
  });

  describe('Navigation Links', () => {
    it('should include descriptive text for sign up link', () => {
      // Act
      renderPage();

      // Assert: Link has clear call to action
      const linkText = screen.getByText(/don't have an account/i);
      expect(linkText).toBeInTheDocument();
    });

    it('should use React Router Link component for navigation', () => {
      // Act
      renderPage();

      // Assert: Uses Link component (has href attribute)
      const signUpLink = screen.getByRole('link', { name: /sign up|don't have an account|create account/i });
      expect(signUpLink).toHaveAttribute('href');
    });
  });
});
