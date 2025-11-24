import React, { useState } from 'react';
import { Box, Container, Typography, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { style4V2SharedTheme } from '../theme/style4V2SharedTheme';

/**
 * EmailVerificationRequired Component
 *
 * Page displayed when user needs to verify their email before accessing protected features.
 * Provides instructions and option to resend verification email.
 *
 * Requirements:
 * - FR-020: Email verification requirement before protected route access
 * - FR-022: Redirect here when email_confirmed_at is null
 * - FR-023: Resend verification email functionality
 * - FR-032: Style4-V2 color palette
 * - FR-034: Page content 32px padding
 *
 * @example
 * // In App.tsx routes
 * <Route path="/verify-email" element={<EmailVerificationRequired />} />
 */
export default function EmailVerificationRequired() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!user?.email) {
      setErrorMessage('No email address found');
      return;
    }

    setIsResending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // FR-023: Resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        setErrorMessage(error.message || 'Failed to resend verification email');
      } else {
        setSuccessMessage(`Verification email sent to ${user.email}. Please check your inbox.`);
      }
    } catch (err) {
      setErrorMessage('Network error - please try again');
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: style4V2SharedTheme.palette.background.default, // FR-032: #FFFFFF
        py: 4, // FR-034: 32px padding
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          {/* Page Title */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              mb: 2,
              fontSize: '2rem',
              fontWeight: 600,
              color: style4V2SharedTheme.palette.text.primary, // FR-032: #000000
            }}
          >
            Verify Your Email
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: style4V2SharedTheme.palette.text.secondary,
            }}
          >
            We've sent a verification link to <strong>{user?.email}</strong>.
            Please check your inbox and click the link to verify your email address.
          </Typography>

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Instructions */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              border: `1px solid ${style4V2SharedTheme.palette.divider}`,
              borderRadius: 2,
              textAlign: 'left',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Next Steps:
            </Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2, mb: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                Check your email inbox (and spam folder)
              </li>
              <li style={{ marginBottom: '8px' }}>
                Click the verification link in the email
              </li>
              <li style={{ marginBottom: '8px' }}>
                Return here and refresh the page to access protected features
              </li>
            </Typography>
          </Box>

          {/* Resend Button */}
          <Button
            variant="contained"
            onClick={handleResendEmail}
            disabled={isResending}
            fullWidth
            sx={{ mb: 2 }}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>

          {/* Sign Out Button */}
          <Button
            variant="outlined"
            onClick={handleSignOut}
            fullWidth
            sx={{
              color: style4V2SharedTheme.palette.text.secondary,
              borderColor: style4V2SharedTheme.palette.divider,
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
