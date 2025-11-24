import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface MapLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

/**
 * Loading overlay that appears over the map during search operations.
 * Keeps the map visible while showing a loading spinner.
 * Style4-V2 compliant with black/white/gray palette.
 *
 * Features:
 * - Semi-transparent dark backdrop (0.3 opacity)
 * - Centered CircularProgress spinner (black color from Style4-V2)
 * - Optional message text
 * - Smooth 300ms fade animations
 * - Positioned absolute with Z-index 100
 * - Pointer-events none to allow underlying map interaction
 */
export const MapLoadingOverlay: React.FC<MapLoadingOverlayProps> = ({
  isVisible,
  message = 'Loading properties...',
}) => {
  if (!isVisible) return null;

  return (
    <Fade in={isVisible} timeout={300}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          pointerEvents: 'none', // Allow underlying map interaction
          borderRadius: 'inherit',
        }}
      >
        <CircularProgress
          size={48}
          sx={{
            color: '#0b2d2c', // Use black from Style4-V2 palette
          }}
        />
        {message && (
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: '#0b2d2c',
              fontWeight: 500,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default MapLoadingOverlay;
