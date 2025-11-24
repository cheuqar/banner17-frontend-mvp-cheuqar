import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignUpForm from '../components/auth/SignUpForm';
import AuthErrorAlert from '../components/auth/AuthErrorAlert';
import { style4V2SharedTheme } from '../theme/style4V2SharedTheme';

/**
 * SignUpPage Component
 *
 * Dedicated sign up page with email/password registration.
 * Redirects to email verification page after successful account creation.
 *
 * Requirements:
 * - FR-002: Sign up page with form and redirect to email verification
 * - FR-028: Page composition (SignUpForm + AuthErrorAlert + layout)
 * - FR-032: Style4-V2 color palette (#000000 text, #FFFFFF background)
 * - FR-034: Page content 32px padding
 * - FR-049: Handle already-authenticated users (redirect to home)
 *
 * @example
 * // In App.tsx routes
 * <Route path="/sign-up" element={<SignUpPage />} />
 */
export default function SignUpPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // FR-049: Redirect to home if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSignUpSuccess = () => {
    // FR-002: Redirect to email verification page after successful sign up
    setError(null); // Clear any previous errors
    navigate('/verify-email');
  };

  const handleSignUpError = (errorMessage: string) => {
    // FR-028: Display error via AuthErrorAlert
    setError(errorMessage);
  };

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: style4V2SharedTheme.palette.background.default, // FR-032: #FFFFFF
        }}
      >
        <CircularProgress sx={{ color: style4V2SharedTheme.palette.primary.main }} />
      </Box>
    );
  }

  // Don't render if authenticated (redirect is in progress)
  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      component="main" // Semantic HTML landmark
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: style4V2SharedTheme.palette.background.default, // FR-032: #FFFFFF
        py: 4, // FR-034: 32px padding (MUI spacing: 4 = 32px)
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ p: 4 }}> {/* FR-034: 32px padding */}
          {/* Page Title */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              mb: 1,
              fontSize: '2rem',
              fontWeight: 600,
              color: style4V2SharedTheme.palette.text.primary, // FR-032: #000000
              textAlign: 'center',
            }}
          >
            Create Account
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 4,
              color: style4V2SharedTheme.palette.text.secondary, // Gray
              textAlign: 'center',
            }}
          >
            Sign up to access property search features
          </Typography>

          {/* FR-028: AuthErrorAlert for error display */}
          <AuthErrorAlert error={error} />

          {/* FR-028: SignUpForm component */}
          <SignUpForm
            onSuccess={handleSignUpSuccess}
            onError={handleSignUpError}
          />

          {/* Link to Sign In page */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: style4V2SharedTheme.palette.text.secondary }}>
              Already have an account?{' '}
              <MuiLink
                component={Link}
                to="/sign-in"
                sx={{
                  color: style4V2SharedTheme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign In
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
