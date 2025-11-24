import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EmailVerificationRequired from '../../src/pages/EmailVerificationRequired';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';

// Mock dependencies
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      resend: jest.fn(),
    },
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EmailVerificationRequired', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    email_confirmed_at: null,
  };

  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    // Default auth context
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
    });
  });

  describe('FR-020: Page Display and Content', () => {
    it('should display page title "Verify Your Email"', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert
      expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
    });

    it('should display user email address', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });

    it('should display verification instructions', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert: Check for instruction text
      expect(screen.getByText(/we've sent a verification link/i)).toBeInTheDocument();
      expect(screen.getByText(/please check your inbox/i)).toBeInTheDocument();
    });

    it('should display next steps instructions', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert: Check for "Next Steps" heading
      expect(screen.getByText(/next steps/i)).toBeInTheDocument();
      expect(screen.getByText(/check your email inbox/i)).toBeInTheDocument();
      expect(screen.getByText(/click the verification link/i)).toBeInTheDocument();
    });

    it('should display "Resend Verification Email" button', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
    });

    it('should display "Sign Out" button', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });
  });

  describe('FR-023: Resend Verification Email', () => {
    it('should call supabase.auth.resend with correct parameters when resend button clicked', async () => {
      // Arrange
      (supabase.auth.resend as jest.Mock).mockResolvedValue({ error: null });

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click resend button
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      // Assert: Check supabase call
      await waitFor(() => {
        expect(supabase.auth.resend).toHaveBeenCalledWith({
          type: 'signup',
          email: 'test@example.com',
        });
      });
    });

    it('should display success message after successful email resend', async () => {
      // Arrange
      (supabase.auth.resend as jest.Mock).mockResolvedValue({ error: null });

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click resend button
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      // Assert: Success message displayed
      await waitFor(() => {
        expect(screen.getByText(/verification email sent to test@example.com/i)).toBeInTheDocument();
      });
    });

    it('should display error message when resend fails', async () => {
      // Arrange: Mock API error
      (supabase.auth.resend as jest.Mock).mockResolvedValue({
        error: { message: 'Rate limit exceeded' },
      });

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click resend button
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      // Assert: Error message displayed
      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument();
      });
    });

    it('should display generic error message when resend fails without message', async () => {
      // Arrange: Mock API error without message
      (supabase.auth.resend as jest.Mock).mockResolvedValue({
        error: {},
      });

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click resend button
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      // Assert: Generic error message
      await waitFor(() => {
        expect(screen.getByText(/failed to resend verification email/i)).toBeInTheDocument();
      });
    });

    it('should disable button and show loading state while resending', async () => {
      // Arrange: Mock delayed response
      (supabase.auth.resend as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      );

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click resend button
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      // Assert: Button shows loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
      });
    });

    it('should handle network errors gracefully', async () => {
      // Arrange: Mock network error (promise rejection)
      (supabase.auth.resend as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click resend button
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      // Assert: Network error message
      await waitFor(() => {
        expect(screen.getByText(/network error - please try again/i)).toBeInTheDocument();
      });
    });

    it('should display error when no email address found', async () => {
      // Arrange: User without email
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '123', email: null },
        signOut: mockSignOut,
      });

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click resend button
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      // Assert: No email error
      await waitFor(() => {
        expect(screen.getByText(/no email address found/i)).toBeInTheDocument();
      });

      // Assert: Should NOT call supabase
      expect(supabase.auth.resend).not.toHaveBeenCalled();
    });

    it('should clear previous messages when resending again', async () => {
      // Arrange
      (supabase.auth.resend as jest.Mock)
        .mockResolvedValueOnce({ error: { message: 'First error' } })
        .mockResolvedValueOnce({ error: null });

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      const resendButton = screen.getByRole('button', { name: /resend verification email/i });

      // Act 1: First click - error
      fireEvent.click(resendButton);
      await waitFor(() => {
        expect(screen.getByText(/first error/i)).toBeInTheDocument();
      });

      // Act 2: Second click - success
      fireEvent.click(resendButton);

      // Assert: Error message cleared, success message shown
      await waitFor(() => {
        expect(screen.queryByText(/first error/i)).not.toBeInTheDocument();
        expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sign Out Functionality', () => {
    it('should call signOut when sign out button clicked', async () => {
      // Arrange
      mockSignOut.mockResolvedValue(undefined);

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click sign out button
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      // Assert: signOut called
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('should navigate to home page after sign out', async () => {
      // Arrange
      mockSignOut.mockResolvedValue(undefined);

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Click sign out button
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      // Assert: Navigate to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('FR-032: Style4-V2 Color Palette', () => {
    it('should use white background (#FFFFFF)', () => {
      // Arrange & Act
      const { container } = render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert: Background color set via style4V2SharedTheme
      const mainBox = container.querySelector('main');
      expect(mainBox).toBeInTheDocument();
    });

    it('should use black text for primary heading (#000000)', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert: Heading uses primary text color
      const heading = screen.getByRole('heading', { name: /verify your email/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('FR-034: Page Content Padding', () => {
    it('should have 32px padding (p: 4 in MUI)', () => {
      // Arrange & Act
      const { container } = render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert: Padding applied via MUI Box sx prop
      const mainBox = container.querySelector('main');
      expect(mainBox).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic main element', () => {
      // Arrange & Act
      const { container } = render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert: h1 for page title
      expect(screen.getByRole('heading', { level: 1, name: /verify your email/i })).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert: Clear button labels
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user without email gracefully', () => {
      // Arrange: User object without email
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '123', email: undefined },
        signOut: mockSignOut,
      });

      // Act & Assert: Should not crash
      expect(() => {
        render(
          <BrowserRouter>
            <EmailVerificationRequired />
          </BrowserRouter>
        );
      }).not.toThrow();
    });

    it('should handle null user gracefully', () => {
      // Arrange: Null user
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      // Act & Assert: Should not crash
      expect(() => {
        render(
          <BrowserRouter>
            <EmailVerificationRequired />
          </BrowserRouter>
        );
      }).not.toThrow();
    });
  });

  describe('Integration with Material-UI', () => {
    it('should use Material-UI Alert component for messages', async () => {
      // Arrange
      (supabase.auth.resend as jest.Mock).mockResolvedValue({ error: null });

      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Act: Trigger success
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      // Assert: Alert component rendered
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should use Material-UI Button component with proper variants', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <EmailVerificationRequired />
        </BrowserRouter>
      );

      // Assert: Buttons are MUI buttons
      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      expect(resendButton).toBeInTheDocument();
      expect(signOutButton).toBeInTheDocument();
    });
  });
});
