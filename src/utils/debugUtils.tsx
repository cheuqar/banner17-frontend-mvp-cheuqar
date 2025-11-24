/**
 * Utility functions for debug mode detection and debug UI components
 */
import React from 'react';
import { Typography, Box } from '@mui/material';

/**
 * Check if DEBUG mode is enabled
 * @returns {boolean} True if debug mode is active
 */
export const isDebugMode = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' || 
    process.env.REACT_APP_DEBUG === 'true' ||
    import.meta.env.VITE_DEBUG === 'true' ||
    window.location.search.includes('debug=true')
  );
};

/**
 * Component for displaying unique IDs in debug mode
 */
interface DebugIdDisplayProps {
  id: string | undefined;
  label?: string;
}

export const DebugIdDisplay: React.FC<DebugIdDisplayProps> = ({ 
  id, 
  label = 'Unique ID' 
}) => {
  if (!isDebugMode() || !id) {
    return null;
  }

  return (
    <Box sx={{ mb: 0.5 }}>
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.secondary',
          fontSize: '0.7rem',
          fontFamily: 'monospace',
          opacity: 0.7,
          fontWeight: 400
        }}
      >
        {label}: {id}
      </Typography>
    </Box>
  );
};
