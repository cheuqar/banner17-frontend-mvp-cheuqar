/**
 * Component: ComingSoonModal
 * 
 * "Coming Soon" notification for Daycare and Amenities features (Phase 1)
 * Uses Material-UI Snackbar (toast) for non-intrusive user feedback
 * 
 * Features:
 * - Auto-dismiss after 3000ms (3 seconds)
 * - Bottom-center positioning
 * - Simple close button
 * - White background with black text (Style4-V2)
 */

import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;  // Custom message to display
}

/**
 * ComingSoonModal Component
 * 
 * Displays a "Coming Soon" toast notification for placeholder features
 */
export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  open,
  onClose,
  message = 'This feature is currently in development. We\'ll let you know when it\'s ready!',
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}  // Auto-dismiss after 3 seconds
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      sx={{
        bottom: { xs: 16, sm: 24 },  // 16px mobile, 24px desktop from bottom
      }}
    >
      <Alert
        onClose={onClose}
        severity="info"
        variant="filled"
        sx={{
          backgroundColor: '#000000',  // Black background (Style4-V2)
          color: '#ffffff',  // White text
          fontWeight: 500,
          
          '& .MuiAlert-icon': {
            color: '#ffffff',  // White icon
          },
          
          '& .MuiAlert-message': {
            padding: '8px 0',
          },
          
          // Close button styling
          '& .MuiAlert-action': {
            paddingTop: 0,
            '& .MuiIconButton-root': {
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, color: '#ffffff' }}>
          Coming Soon
        </AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ComingSoonModal;

