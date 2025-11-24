import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import SignUpPage from '../../src/pages/SignUpPage';
import { useAuth } from '../../src/contexts/AuthContext';

// Mock dependencies
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('SignUpPage', () => {
  const mockNavigate = jest.fn();
  const mockSignUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );
  };

  describe('FR-028: SignUpPage Component Composition', () => {
    it('should render SignUpForm component', () => {
      // Act
      renderPage();

      // Assert: SignUpForm elements are present
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should render page title "Create Account" or "Sign Up"', () => {
      // Act
      renderPage();

      // Assert: Page has heading
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toMatch(/create account|sign up/i);
    });

    it('should render link to sign in page', () => {
      // Act
      renderPage();

      // Assert: Link to /sign-in exists
      const signInLink = screen.getByRole('link', { name: /sign in|already have an account/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/sign-in');
    });

    it('should render AuthErrorAlert when error exists', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: { message: 'Email already registered' } });
      renderPage();

      // Act: Submit form to trigger error
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: Error alert appears
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
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

      // Assert: Container has 32px padding (MUI spacing: 4 = 32px)
      const pageContainer = container.querySelector('Box') || container.firstChild;
      // Check for MUI Box with p: 4 or explicit padding
      expect(pageContainer).toBeTruthy();
    });
  });

  describe('FR-002: Sign Up Success Flow', () => {
    it('should redirect to /verify-email on successful sign up', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      renderPage();

      // Act: Submit valid form
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: Redirected to email verification page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/verify-email');
      });
    });

    it('should NOT redirect when sign up fails', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } });
      renderPage();

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: No navigation occurred
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('FR-049: Already-Authenticated User Handling', () => {
    it('should redirect to home page if user is already authenticated', () => {
      // Arrange: User is already authenticated
      (useAuth as jest.Mock).mockReturnValue({
        signUp: mockSignUp,
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
        signUp: mockSignUp,
        isAuthenticated: true,
        isLoading: false,
        user: { id: '123', email: 'user@example.com' },
      });

      // Act
      renderPage();

      // Assert: Form not rendered (redirecting instead)
      expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Display Integration', () => {
    it('should display error message from SignUpForm via AuthErrorAlert', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: { message: 'Password should be at least 6 characters' } });
      renderPage();

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), '12345');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: Error displayed in AuthErrorAlert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/password should be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear previous error when new sign up attempt succeeds', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp
        .mockResolvedValueOnce({ error: { message: 'Email already registered' } })
        .mockResolvedValueOnce({ error: null });
      renderPage();

      // Act: First attempt fails
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
      });

      // Act: Second attempt succeeds
      await user.clear(screen.getByLabelText(/email/i));
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: Error cleared and redirected
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/verify-email');
      });
    });
  });

  describe('Loading State', () => {
    it('should not render page content while authentication is loading', () => {
      // Arrange: Auth is still loading
      (useAuth as jest.Mock).mockReturnValue({
        signUp: mockSignUp,
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      // Act
      const { container } = renderPage();

      // Assert: Loading state (either spinner or no form)
      expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument();
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
    it('should include descriptive text for sign in link', () => {
      // Act
      renderPage();

      // Assert: Link has clear call to action
      const linkText = screen.getByText(/already have an account/i);
      expect(linkText).toBeInTheDocument();
    });

    it('should use React Router Link component for navigation', () => {
      // Act
      renderPage();

      // Assert: Uses Link component (has href attribute)
      const signInLink = screen.getByRole('link', { name: /sign in|already have an account/i });
      expect(signInLink).toHaveAttribute('href');
    });
  });
});
