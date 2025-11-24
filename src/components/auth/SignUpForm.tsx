import React, { useState } from 'react';
import { TextField, Button, Stack, CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface SignUpFormProps {
  onSuccess: () => void;
  onError?: (error: string) => void;
}

/**
 * SignUpForm Component
 *
 * Sign up form with email/password validation and AuthContext integration.
 * Uses Material-UI components with Style4-V2 design system.
 *
 * Requirements:
 * - FR-002: Sign up functionality with email and password
 * - FR-004: Password validation (minimum 6 characters)
 * - FR-014: User-friendly error handling
 * - FR-029: Prop interface with callbacks
 * - FR-033: Material-UI outlined TextField and contained Button
 * - FR-034: Spacing (16px fields, 24px button margin)
 * - FR-035: Loading state with spinner and status text
 * - FR-042: Use existing AuthContext signUp method (NO MODIFICATIONS)
 * - FR-045: Email validation with regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 * - FR-046: Specific validation error messages
 * - FR-048: Network error handling
 *
 * @param {function} onSuccess - Called when sign up succeeds
 * @param {function} onError - Optional callback for error handling
 *
 * @example
 * <SignUpForm
 *   onSuccess={() => navigate('/verify-email')}
 *   onError={(error) => setErrorMessage(error)}
 * />
 */
export default function SignUpForm({ onSuccess, onError }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FR-045: Email validation regex
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email is required'); // FR-046
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Invalid email format'); // FR-046
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required'); // FR-046
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters'); // FR-046, FR-004
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const handlePasswordBlur = () => {
    validatePassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return; // Don't submit if validation fails
    }

    setIsLoading(true); // FR-035: Show loading state

    try {
      // FR-042: Call existing AuthContext signUp method (NO MODIFICATIONS)
      const { error } = await signUp(email, password);

      if (error) {
        // FR-014, FR-046: Handle sign up errors
        const errorMessage = error.message || 'Sign up failed';
        if (onError) {
          onError(errorMessage);
        }
      } else {
        // FR-002: Sign up succeeded
        onSuccess();
      }
    } catch (err) {
      // FR-048: Network error handling
      const errorMessage = 'Network error - please check your connection and retry';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}> {/* FR-034: 16px vertical spacing between fields */}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          error={!!emailError}
          helperText={emailError}
          disabled={isLoading}
          required
          fullWidth
          variant="outlined" // FR-033: Material-UI outlined variant
          autoComplete="email"
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={handlePasswordBlur}
          error={!!passwordError}
          helperText={passwordError}
          disabled={isLoading}
          required
          fullWidth
          variant="outlined" // FR-033: Material-UI outlined variant
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="contained" // FR-033: Material-UI contained variant
          fullWidth
          disabled={isLoading}
          sx={{ mt: 3 }} // FR-034: 24px top margin (MUI spacing: 3 = 24px)
        >
          {isLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} color="inherit" /> {/* FR-035: Loading spinner */}
              <span>Creating account...</span> {/* FR-035: Status text */}
            </Stack>
          ) : (
            'Sign Up'
          )}
        </Button>
      </Stack>
    </Box>
  );
}
