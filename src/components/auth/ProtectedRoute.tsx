import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Wrapper component that protects routes requiring authentication and email verification.
 * Redirects unauthenticated users to sign in page with return URL preservation.
 * Redirects users with unverified emails to email verification page.
 *
 * Requirements:
 * - FR-010: Redirect unauthenticated users to /sign-in
 * - FR-022: Redirect users with unverified emails to /verify-email
 * - FR-025: Protect /search, /smart-search, /chat routes
 * - FR-047: Return URL preservation via location state AND query parameter
 *
 * @param {React.ReactNode} children - Protected content to render when access is granted
 *
 * @example
 * // In App.tsx routes
 * <Route
 *   path="/search"
 *   element={
 *     <ProtectedRoute>
 *       <SmartSearchPage />
 *     </ProtectedRoute>
 *   }
 * />
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // FR-010: Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    // FR-047: Preserve return URL in both location state (primary) and query parameter (fallback)
    const returnUrl = location.pathname + location.search;
    return (
      <Navigate
        to={`/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`}
        state={{ returnUrl }}
        replace
      />
    );
  }

  // FR-022: Check email verification status
  // If user is authenticated but email not verified, redirect to verification page
  if (!user || !user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  // All checks passed - render protected content
  // Support both wrapper mode (children) and layout mode (Outlet)
  return children ? <>{children}</> : <Outlet />;
}
