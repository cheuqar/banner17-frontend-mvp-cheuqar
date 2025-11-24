/**
 * Component: UserProfileButton (TopNavigation)
 *
 * Displays user profile button with avatar and name when authenticated
 * Shows "Sign in" button when not authenticated (Phase 2.31)
 *
 * Features:
 * - Avatar display (32px circle) when authenticated
 * - User name next to avatar
 * - Click handler to open UserProfilePanel drawer
 * - "Sign in" fallback for unauthenticated users
 * - Responsive: Name hidden on mobile (<600px), only avatar shown
 * - Matches TopNavigation styling (transparent bg, black text/border)
 * - WCAG AA accessibility compliance
 *
 * Design Tokens (Style4-V2):
 * - Avatar: 32px, circular, background #e0e0e0
 * - Text: 15px/600, color #0b2d2c
 * - Button: transparent bg, border #0b2d2c
 * - Hover: opacity 0.7
 */

import React, { useCallback } from 'react';
import {
  Box,
  Button,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../../../contexts/AuthContext';

interface UserProfileButtonProps {
  onProfileClick: () => void;
  isLoading?: boolean;
}

/**
 * User Profile Button Component
 *
 * Replaces the static "Sign in" button with an authenticated user profile button
 * or shows "Sign in" button for unauthenticated users.
 */
export const UserProfileButton: React.FC<UserProfileButtonProps> = ({
  onProfileClick,
  isLoading = false,
}) => {
  const { user, userProfile, isAuthenticated } = useAuth();

  /**
   * Handle profile button click
   */
  const handleClick = useCallback(() => {
    if (isAuthenticated && !isLoading) {
      onProfileClick();
    }
  }, [isAuthenticated, isLoading, onProfileClick]);

  // Authenticated user: Show avatar + name
  if (isAuthenticated && user) {
    const displayName =
      userProfile?.full_name ||
      userProfile?.name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'User';

    const avatarUrl = userProfile?.avatar_url || user.user_metadata?.avatar_url;

    return (
      <Tooltip title="Click to open profile menu">
        <Button
          onClick={handleClick}
          disabled={isLoading}
          aria-label={`Profile menu for ${displayName}`}
          aria-expanded="false"
          aria-haspopup="dialog"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0px 8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'transparent',
              opacity: isLoading ? 0.5 : 0.7,
            },
            '&:focus': {
              outline: '2px solid #0b2d2c',
              outlineOffset: '2px',
              borderRadius: '4px',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          {/* Avatar */}
          <Avatar
            src={avatarUrl || undefined}
            sx={{
              width: 32,
              height: 32,
              backgroundColor: '#e0e0e0',
              color: '#0b2d2c',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {!avatarUrl && displayName.charAt(0).toUpperCase()}
          </Avatar>

          {/* User Name - Hidden on mobile, shown on tablet+ */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontSize: '15px',
              fontWeight: 600,
              color: '#0b2d2c',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </Box>

          {/* Loading indicator */}
          {isLoading && (
            <CircularProgress
              size={16}
              sx={{
                position: 'absolute',
                color: '#0b2d2c',
              }}
            />
          )}
        </Button>
      </Tooltip>
    );
  }

  // Unauthenticated: Show "Sign in" button with tooltip
  return (
    <Tooltip title="Sign in page coming soon">
      <span>
        <Button
          disabled={true}
          aria-label="Sign in to your account (coming soon)"
          sx={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#999999',
            backgroundColor: 'transparent',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '8px 20px',
            cursor: 'not-allowed',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'transparent',
              borderColor: '#e0e0e0',
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          Sign in
        </Button>
      </span>
    </Tooltip>
  );
};

export default UserProfileButton;
