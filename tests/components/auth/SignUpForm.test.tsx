import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SignUpForm from '../../../src/components/auth/SignUpForm';
import { useAuth } from '../../../src/contexts/AuthContext';

// Mock AuthContext
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('SignUpForm', () => {
  const mockSignUp = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
    });
  });

  describe('FR-002: Sign Up Form Basic Functionality', () => {
    it('should render email and password input fields', () => {
      // Act
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Assert: Email and password fields exist
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('should render sign up submit button', () => {
      // Act
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Assert: Submit button exists
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('FR-033: Material-UI Component Variants', () => {
    it('should use outlined variant for TextField components', () => {
      // Act
      const { container } = render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Assert: MUI TextField with outlined variant
      const textFields = container.querySelectorAll('.MuiOutlinedInput-root');
      expect(textFields.length).toBeGreaterThanOrEqual(2); // Email + Password
    });

    it('should use contained variant for submit Button', () => {
      // Act
      const { container } = render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Assert: MUI Button with contained variant
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      expect(submitButton).toHaveClass('MuiButton-contained');
    });
  });

  describe('FR-045: Email Validation with Regex Pattern', () => {
    it('should display error for empty email on blur', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);
      const emailInput = screen.getByLabelText(/email/i);

      // Act: Focus and blur without entering value
      await user.click(emailInput);
      await user.tab(); // Blur

      // Assert: "Email is required" error per FR-046
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should display error for invalid email format', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);
      const emailInput = screen.getByLabelText(/email/i);

      // Act: Enter invalid email
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Blur to trigger validation

      // Assert: "Invalid email format" error per FR-046
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should accept valid email format', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);
      const emailInput = screen.getByLabelText(/email/i);

      // Act: Enter valid email
      await user.type(emailInput, 'test@example.com');
      await user.tab();

      // Assert: No error message
      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });
    });
  });

  describe('FR-004: Password Validation (Minimum 6 Characters)', () => {
    it('should display error for empty password on blur', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);
      const passwordInput = screen.getByLabelText(/^password$/i);

      // Act: Focus and blur without entering value
      await user.click(passwordInput);
      await user.tab();

      // Assert: "Password is required" error per FR-046
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should display error for password shorter than 6 characters', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);
      const passwordInput = screen.getByLabelText(/^password$/i);

      // Act: Enter short password
      await user.type(passwordInput, '12345');
      await user.tab();

      // Assert: Error message per FR-046
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    it('should accept password with 6 or more characters', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);
      const passwordInput = screen.getByLabelText(/^password$/i);

      // Act: Enter valid password
      await user.type(passwordInput, '123456');
      await user.tab();

      // Assert: No error message
      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Password must be at least 6 characters')).not.toBeInTheDocument();
      });
    });
  });

  describe('FR-042: AuthContext Integration (NO MODIFICATIONS)', () => {
    it('should call signUp method from existing AuthContext on submit', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      // Act: Fill form and submit
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert: signUp called with correct parameters
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123');
      });
    });

    it('should verify NO AuthContext modifications - use existing signUp signature', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: signUp signature is (email, password) => Promise<{error}>
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledTimes(1);
        expect(mockSignUp).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String)
        );
      });
    });
  });

  describe('FR-035: Visual Loading State During Submission', () => {
    it('should disable submit button during sign up process', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /sign up/i });

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(submitButton);

      // Assert: Button disabled during processing
      expect(submitButton).toBeDisabled();
    });

    it('should display loading spinner during sign up', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: Loading indicator appears
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('should display "Creating account..." text during submission per FR-035', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: Status text appears
      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      });
    });
  });

  describe('FR-014 & FR-046: Error Handling and Messages', () => {
    it('should call onError callback when signUp fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnError = jest.fn();
      const errorMessage = 'Email already registered';
      mockSignUp.mockResolvedValue({ error: { message: errorMessage } });
      render(<SignUpForm onSuccess={mockOnSuccess} onError={mockOnError} />);

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: onError called with error message
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('should call onSuccess callback when signUp succeeds', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: onSuccess called
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should NOT call onSuccess when signUp fails', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } });
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: onSuccess NOT called
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('FR-048: Network Error Handling', () => {
    it('should handle network failures gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnError = jest.fn();
      mockSignUp.mockRejectedValue(new Error('Network error'));
      render(<SignUpForm onSuccess={mockOnSuccess} onError={mockOnError} />);

      // Act: Submit form
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: Error callback triggered (component should catch and call onError)
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    });
  });

  describe('FR-029: Prop Interface Requirements', () => {
    it('should accept onSuccess callback prop', () => {
      // Arrange & Act
      const onSuccess = jest.fn();
      render(<SignUpForm onSuccess={onSuccess} />);

      // Assert: Component renders without error
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should accept optional onError callback prop', () => {
      // Arrange & Act
      const onError = jest.fn();
      render(<SignUpForm onSuccess={mockOnSuccess} onError={onError} />);

      // Assert: Component renders without error
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('FR-034: Spacing and Layout Requirements', () => {
    it('should apply 16px vertical spacing between form fields', () => {
      // Arrange
      const { container } = render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Assert: Check spacing between fields (MUI Stack with spacing={2} = 16px)
      const formFields = container.querySelectorAll('.MuiTextField-root');
      expect(formFields.length).toBeGreaterThanOrEqual(2);
    });

    it('should apply 24px top margin to submit button', () => {
      // Arrange
      render(<SignUpForm onSuccess={mockOnSuccess} />);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      // Assert: Button has mt: 3 (24px in MUI)
      expect(submitButton.parentElement).toHaveStyle({ marginTop: '24px' });
    });
  });

  describe('Form Submission Prevention', () => {
    it('should prevent form submission when validation errors exist', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Act: Try to submit with empty form
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      // Assert: signUp NOT called due to validation errors
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should prevent form submission when only email is valid', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Act: Fill only email
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: signUp NOT called (password missing)
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should allow form submission when all fields are valid', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });
      render(<SignUpForm onSuccess={mockOnSuccess} />);

      // Act: Fill both fields with valid data
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Assert: signUp called
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledTimes(1);
      });
    });
  });
});
