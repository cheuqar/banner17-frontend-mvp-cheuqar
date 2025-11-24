import { useLocation, useSearchParams } from 'react-router-dom';

/**
 * useReturnUrl Hook
 *
 * Extracts return URL for post-authentication redirect using dual mechanism:
 * 1. Primary: React Router location state (survives navigation)
 * 2. Fallback: Query parameter ?returnUrl= (survives browser refresh)
 *
 * @returns {string} Return URL path (defaults to "/" if not found)
 *
 * Requirements:
 * - FR-031: useReturnUrl hook integration with SignInPage redirect logic
 * - FR-047: Return URL preservation via location state AND query parameter
 *
 * @example
 * // ProtectedRoute redirects unauthenticated user to sign in
 * <Navigate
 *   to="/sign-in"
 *   state={{ returnUrl: location.pathname }}
 *   replace
 * />
 *
 * // SignInPage uses hook to redirect after successful sign in
 * const SignInPage = () => {
 *   const returnUrl = useReturnUrl();
 *   const navigate = useNavigate();
 *
 *   const handleSuccess = () => {
 *     navigate(returnUrl); // Redirects to /search or default "/"
 *   };
 * };
 */
export function useReturnUrl(): string {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // FR-047: Primary mechanism - location state (set by ProtectedRoute)
  const stateReturnUrl = location.state?.returnUrl;
  if (stateReturnUrl && typeof stateReturnUrl === 'string' && stateReturnUrl.trim()) {
    return stateReturnUrl;
  }

  // FR-047: Fallback mechanism - query parameter (survives refresh)
  const queryReturnUrl = searchParams.get('returnUrl');
  if (queryReturnUrl && queryReturnUrl.trim()) {
    return queryReturnUrl; // URLSearchParams automatically decodes
  }

  // Default: Home page
  return '/';
}
