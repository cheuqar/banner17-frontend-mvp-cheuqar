/**
 * Component: ApplyButton (CompactFilterBar)
 *
 * Apply button to execute property search within current map bounds (Phase 2.30)
 *
 * Features:
 * - Black background (#0b2d2c), white text (#ffffff)
 * - Icon: SearchIcon
 * - Text: "Apply"
 * - OnClick: Dispatches searchByBounds with current map bounds
 * - 100px width, 44px height
 * - Disabled state: When searchPending = true (prevents duplicate API calls)
 * - Mandatory bbox filtering: Always uses bounds-based search (no fallback to location-only search)
 *
 * Design Tokens (from Phase 2.30 specs):
 * - Width: 100px
 * - Height: 44px
 * - Background: #0b2d2c (black, Style4-V2 monochrome)
 * - Text color: #ffffff (white)
 * - Border: 1px solid #ffffff
 * - Font: 14px/600 (medium weight)
 * - Border-radius: 0 (sharp corners for compact layout)
 *
 * Phase 2.30 Requirements:
 * - MANDATORY bbox filtering (cannot be disabled)
 * - Replaces "All / This Area" toggle (AreaScopeToggle)
 * - Explicit user action (click to search)
 * - Respects Phase 2.22 searchPending guard (prevents concurrent requests)
 */

import React, { useCallback } from 'react';
import {
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../../store';
import { searchByBounds } from '../../../../../store/slices/smartSearchSlice';

interface ApplyButtonProps {
  disabled?: boolean;
}

/**
 * Apply Button Component for Compact Filter Bar
 * Phase 2.30: Mandatory bbox filtering with explicit user action
 */
export const ApplyButton: React.FC<ApplyButtonProps> = ({
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

  // Get current map bounds and search state from Redux
  const mapBounds = useSelector((state: RootState) => state.smartSearch.mapBounds);
  const searchPending = useSelector((state: RootState) => state.smartSearch.searchPending);

  /**
   * Handle Apply button click
   * Dispatches searchByBounds with current map bounds
   * Respects Phase 2.22 searchPending guard to prevent concurrent requests
   */
  const handleApplyClick = useCallback(() => {
    if (!mapBounds) {
      console.warn('[CompactFilterBar.ApplyButton] Map bounds not yet available');
      return;
    }

    if (searchPending) {
      console.warn('[CompactFilterBar.ApplyButton] Search already in progress, ignoring click');
      return;
    }

    console.log('[CompactFilterBar.ApplyButton] Applying filters with map bounds:', mapBounds);
    dispatch(searchByBounds(mapBounds));
  }, [dispatch, mapBounds, searchPending]);

  // Determine button disabled state
  // Disabled if: explicit disabled prop OR no map bounds OR search pending
  const isButtonDisabled = disabled || !mapBounds || searchPending;

  return (
    <Box
      sx={{
        width: '100px',
        height: '44px',
        backgroundColor: '#0b2d2c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        position: 'relative',
        border: '1px solid #ffffff',
        borderRadius: 0,
      }}
    >
      <Button
        onClick={handleApplyClick}
        disabled={isButtonDisabled}
        aria-label="Apply filters and search properties in current map area"
        startIcon={<SearchIcon sx={{ color: '#ffffff', fontSize: '18px' }} />}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'none',
          padding: 0,
          gap: '4px',
          border: 'none',
          cursor: 'pointer',

          '&:hover:not(:disabled)': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },

          '&:focus': {
            outline: '2px solid #ffffff',
            outlineOffset: '-2px',
          },

          '&:disabled': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#999999',
            cursor: 'not-allowed',
          },
        }}
      >
        Apply
      </Button>
    </Box>
  );
};

export default ApplyButton;
