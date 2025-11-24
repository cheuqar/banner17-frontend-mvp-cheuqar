import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignInForm from '../components/auth/SignInForm';
import AuthErrorAlert from '../components/auth/AuthErrorAlert';
import { useReturnUrl } from '../hooks/useReturnUrl';
import { style4V2SharedTheme } from '../theme/style4V2SharedTheme';

/**
 * SignInPage Component
 *
 * Dedicated sign in page with email/password authentication.
 * Redirects to return URL (from ProtectedRoute) or home page after successful sign in.
 *
 * Requirements:
 * - FR-001: Sign in page with form and redirect logic
 * - FR-027: Page composition (SignInForm + AuthErrorAlert + layout)
 * - FR-031: useReturnUrl hook integration for post-signin redirect
 * - FR-032: Style4-V2 color palette (#000000 text, #FFFFFF background)
 * - FR-034: Page content 32px padding
 * - FR-047: Return URL preservation (location state + query parameter)
 * - FR-049: Handle already-authenticated users (redirect to home)
 *
 * @example
 * // In App.tsx routes
 * <Route path="/sign-in" element={<SignInPage />} />
 *
 * // ProtectedRoute redirects here with return URL
 * <Navigate to="/sign-in" state={{ returnUrl: '/search' }} />
 */
export default function SignInPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const returnUrl = useReturnUrl(); // FR-031, FR-047: Extract return URL
  const [error, setError] = useState<string | null>(null);

  // FR-049: Redirect to home if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSignInSuccess = () => {
    // FR-001, FR-031, FR-047: Redirect to return URL or home page
    setError(null); // Clear any previous errors
    navigate(returnUrl); // useReturnUrl provides "/" as default
  };

  const handleSignInError = (errorMessage: string) => {
    // FR-027: Display error via AuthErrorAlert
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
            Welcome Back
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 4,
              color: style4V2SharedTheme.palette.text.secondary, // Gray
              textAlign: 'center',
            }}
          >
            Sign in to continue to your account
          </Typography>

          {/* FR-027: AuthErrorAlert for error display */}
          <AuthErrorAlert error={error} />

          {/* FR-027: SignInForm component */}
          <SignInForm
            onSuccess={handleSignInSuccess}
            onError={handleSignInError}
          />

          {/* Link to Sign Up page */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: style4V2SharedTheme.palette.text.secondary }}>
              Don't have an account?{' '}
              <MuiLink
                component={Link}
                to="/sign-up"
                sx={{
                  color: style4V2SharedTheme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign Up
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
