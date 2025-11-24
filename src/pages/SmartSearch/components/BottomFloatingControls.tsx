import React from 'react';
import { Box, Button, Fade, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AutoSearchCountdown from './AutoSearchCountdown';
import AutoRefreshToggle from './AutoRefreshToggle';
import { useAppSelector } from '../../../store';

interface BottomFloatingControlsProps {
  // Search This Area button props
  searchVisible: boolean;
  onSearchClick: () => void;
  searchLoading?: boolean;

  // Show More Pins button props
  showMoreVisible: boolean;
  onShowMoreClick: () => void;
  showMoreLoading?: boolean;
  remainingCount?: number;
}

const BottomFloatingControls: React.FC<BottomFloatingControlsProps> = ({
  searchVisible,
  onSearchClick,
  searchLoading = false,
  showMoreVisible,
  onShowMoreClick,
  showMoreLoading = false,
  remainingCount
}) => {
  // NEW: Phase 2.8.1 - Auto-refresh and countdown state
  const autoRefreshEnabled = useAppSelector((state) => state.smartSearch.autoRefreshEnabled);
  const isCountdownActive = useAppSelector((state) =>
    state.smartSearch.autoSearchState?.isActive ?? false
  );

  const showMoreText = remainingCount
    ? `Show More (${Math.min(remainingCount, 200)})`
    : 'Show More Pins';

  // Only render if at least one button is visible
  if (!searchVisible && !showMoreVisible) {
    return null;
  }

  return (
    <Fade in={searchVisible || showMoreVisible} timeout={300}>
      <Box
        sx={{
          position: 'absolute',
          bottom: 60, // Increased from 20 to 60 to clear status bar
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column', // Stack vertically: toggle above buttons
          alignItems: 'center',
          gap: 0, // No gap between toggle and buttons
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 2,
          padding: 1,
          boxShadow: 3,
          // Mobile responsive
          '@media (max-width: 768px)': {
            padding: 0.75,
            bottom: 56, // Increased from default to clear mobile status bar
          }
        }}
      >
        {/* NEW: Phase 2.8.1 - Auto-Refresh Toggle (ABOVE buttons) */}
        <AutoRefreshToggle />

        {/* Button Container */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            // Mobile responsive
            '@media (max-width: 768px)': {
              flexDirection: 'column',
              gap: 1,
            }
          }}
        >
          {/* Search This Area Button OR Auto-Search Countdown (CONDITIONAL RENDERING) */}
          {searchVisible && (
            <>
              {/* Show countdown button when auto-refresh enabled AND countdown active */}
              {autoRefreshEnabled && isCountdownActive ? (
                <AutoSearchCountdown />
              ) : (
                /* Show standard button when countdown inactive OR auto-refresh disabled */
                <Button
                  variant="contained"
                  onClick={onSearchClick}
                  disabled={searchLoading}
                  startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&:disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled'
                    },
                    // Mobile responsive
                    '@media (max-width: 768px)': {
                      px: 2,
                      py: 0.75,
                      fontSize: '0.875rem',
                    }
                  }}
                >
                  {searchLoading ? 'Searching...' : 'Search This Area'}
                </Button>
              )}
            </>
          )}

          {/* Show More Pins Button */}
          {showMoreVisible && (
            <Button
              variant="contained"
              onClick={onShowMoreClick}
              disabled={showMoreLoading}
              startIcon={showMoreLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled'
                },
                // Mobile responsive
                '@media (max-width: 768px)': {
                  px: 2,
                  py: 0.75,
                  fontSize: '0.875rem',
                }
              }}
            >
              {showMoreLoading ? 'Loading...' : showMoreText}
            </Button>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default BottomFloatingControls;
