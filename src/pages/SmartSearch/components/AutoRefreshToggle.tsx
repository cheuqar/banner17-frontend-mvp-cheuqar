import React from 'react';
import { Box, Switch, Typography } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setAutoRefreshEnabled } from '../../../store/slices/smartSearchSlice';

/**
 * AutoRefreshToggle Component (Phase 2.8.1)
 *
 * Provides user control over the auto-refresh behavior.
 * When enabled (default), map pan/zoom triggers a 3-second countdown to auto-search.
 * When disabled, users must manually click "Search This Area" button.
 *
 * Design:
 * - FlashOn icon (blue) when enabled
 * - FlashOff icon (gray) when disabled
 * - Material-UI Switch component with small size
 * - State persists in localStorage
 */
const AutoRefreshToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const autoRefreshEnabled = useAppSelector((state) =>
    state.smartSearch.autoRefreshEnabled
  );

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    dispatch(setAutoRefreshEnabled(enabled));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1, // Margin bottom for spacing above buttons
        px: 1, // Horizontal padding
        // Mobile responsive
        '@media (max-width: 768px)': {
          gap: 0.5,
          mb: 0.75,
          px: 0.5,
        }
      }}
    >
      {/* Icon - changes color based on state */}
      {autoRefreshEnabled ? (
        <FlashOnIcon
          sx={{
            color: '#1976d2', // Primary blue for enabled
            fontSize: 20,
          }}
        />
      ) : (
        <FlashOffIcon
          sx={{
            color: 'rgba(0, 0, 0, 0.38)', // Gray for disabled
            fontSize: 20,
          }}
        />
      )}

      {/* Label */}
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: autoRefreshEnabled ? 'text.primary' : 'text.secondary',
          // Mobile responsive
          '@media (max-width: 768px)': {
            fontSize: '0.8125rem',
          }
        }}
      >
        Auto-refresh
      </Typography>

      {/* Switch */}
      <Switch
        checked={autoRefreshEnabled}
        onChange={handleToggle}
        size="small"
        sx={{
          // Custom styling for better visual feedback
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#1976d2',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#1976d2',
          },
        }}
      />
    </Box>
  );
};

export default AutoRefreshToggle;
