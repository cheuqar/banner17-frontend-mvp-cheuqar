import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack
} from '@mui/material';
import {
  Person,
  AccountCircle,
  Settings,
  Help,
  CreditCard,
  Logout,
  AdminPanelSettings,
  Notifications,
  Security,
  Business
} from '@mui/icons-material';

import type { User } from '@supabase/supabase-js';

interface UserProfileMenuProps {
  user: User;
  onSignOut?: () => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onSignOut }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    if (onSignOut) {
      onSignOut();
    }
  };

  const handleMenuItemClick = (action: string) => {
    handleClose();
    // In a real app, these would trigger actual actions
    console.log('Menu action:', action);
  };

  // Get user initials for avatar fallback
  const getUserInitials = (email: string, name?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  // Extract user information from Supabase user object
  const userDisplayName = user?.user_metadata?.full_name || 
                          user?.user_metadata?.name || 
                          user?.email?.split('@')[0] || 
                          'User';
  const userId = user?.id || 'usr_' + Math.random().toString(36).substring(7);
  const userEmail = user?.email || '';
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          p: 0,
          border: '2px solid transparent',
          '&:hover': {
            border: '2px solid #e3f2fd',
            backgroundColor: 'transparent'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <Avatar
          src={userAvatar}
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          {!userAvatar && getUserInitials(userEmail, userDisplayName)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 280,
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            '& .MuiMenu-list': {
              padding: '8px 0',
            },
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 0,
              '&:hover': {
                backgroundColor: '#f8fafc'
              }
            }
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              src={userAvatar}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {!userAvatar && getUserInitials(userEmail, userDisplayName)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                {userDisplayName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {userEmail}
              </Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Chip 
                  label="Pro Plan" 
                  size="small" 
                  sx={{ 
                    height: 16, 
                    fontSize: '0.6rem',
                    bgcolor: 'primary.light',
                    color: 'primary.main'
                  }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  ID: {userId.slice(0, 8)}...
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Main Navigation Items */}
        <MenuItem onClick={() => handleMenuItemClick('my-properties')}>
          <ListItemIcon>
            <Business fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">My Properties</Typography>
            <Typography variant="caption" color="text.secondary">
              Manage your listings
            </Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuItemClick('usage-billing')}>
          <ListItemIcon>
            <CreditCard fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Usage & Billing</Typography>
            <Typography variant="caption" color="text.secondary">
              Track usage and costs
            </Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuItemClick('settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Settings</Typography>
            <Typography variant="caption" color="text.secondary">
              Account preferences
            </Typography>
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* Additional Account Options */}
        <MenuItem onClick={() => handleMenuItemClick('profile')}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile Details</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuItemClick('help')}>
          <ListItemIcon>
            <Help fontSize="small" />
          </ListItemIcon>
          <ListItemText>Help & Support</ListItemText>
        </MenuItem>

        {/* Admin (if applicable) */}
        {userEmail === 'admin@listez.com' && (
          <MenuItem onClick={() => handleMenuItemClick('admin')}>
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Admin Panel</ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Sign Out */}
        <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserProfileMenu;
