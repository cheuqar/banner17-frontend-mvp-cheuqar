/**
 * Phase 2.22: Search Progress Indicator Component
 * ================================================
 *
 * Displays a subtle indicator at the top center of the map when a search is in progress.
 * Shows "Refreshing properties..." with a rotating spinner.
 *
 * Design: Style4-V2 compliant (black/white/gray palette only)
 * Positioning: Absolute positioning at top center of map container
 * Z-index: 1100 (above map tiles, below floating controls)
 *
 * Accessibility:
 * - aria-live="polite" for screen reader announcements
 * - aria-busy attribute reflects loading state
 * - role="status" for status region
 * - aria-label for context
 */

import React from 'react';
import { useAppSelector } from '../../../store';
import { selectSearchPending } from '../../../store/slices/smartSearchSlice';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

const SearchProgressIndicator: React.FC = () => {
  const searchPending = useAppSelector(selectSearchPending);

  if (!searchPending) {
    return null;
  }

  return (
    <Fade in={searchPending} timeout={300}>
      <Box
        role="status"
        aria-live="polite"
        aria-busy={searchPending}
        aria-label="Search in progress"
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '10px 16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CCCCCC',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none', // Allow clicks to pass through
        }}
      >
        <CircularProgress
          size={20}
          thickness={4}
          sx={{
            color: '#404040',
            flexShrink: 0,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color: '#0b2d2c',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Refreshing properties...
        </Typography>
      </Box>
    </Fade>
  );
};

export default SearchProgressIndicator;
