import React from 'react';
import { Button, Fade, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ShowMorePinsButtonProps {
  visible: boolean;
  onClick: () => void;
  loading?: boolean;
  remainingCount?: number;
}

const ShowMorePinsButton: React.FC<ShowMorePinsButtonProps> = ({
  visible,
  onClick,
  loading = false,
  remainingCount
}) => {
  const displayText = remainingCount
    ? `Show More (${Math.min(remainingCount, 200)})`
    : 'Show More Pins';

  return (
    <Fade in={visible} timeout={300}>
      <Button
        variant="contained"
        onClick={onClick}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
        sx={{
          position: 'absolute',
          top: 64, // Below SearchThisAreaButton (16px top + 48px button height)
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          bgcolor: 'secondary.main',
          color: 'white',
          boxShadow: 3,
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
          py: 1,
          '&:hover': {
            bgcolor: 'secondary.dark',
            boxShadow: 4
          },
          '&:disabled': {
            bgcolor: 'action.disabledBackground',
            color: 'action.disabled'
          }
        }}
      >
        {loading ? 'Loading...' : displayText}
      </Button>
    </Fade>
  );
};

export default ShowMorePinsButton;
