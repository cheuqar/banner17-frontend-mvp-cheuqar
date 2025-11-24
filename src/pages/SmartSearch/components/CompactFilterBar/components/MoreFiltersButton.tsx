/**
 * Component: MoreFiltersButton (CompactFilterBar)
 *
 * Button to open advanced filters dialog/drawer (Phase 2.28.3)
 * Reuses existing FilterDialog (desktop) and FilterDrawer (mobile) components
 *
 * Features:
 * - White background (#ffffff), right-rounded (0 8px 8px 0)
 * - Icon: FilterListIcon
 * - Text: "More Filters"
 * - Badge: Shows count of active advanced filters (bathrooms, parking, land size, etc.)
 * - OnClick: Opens existing FilterDialog/FilterDrawer
 * - 140px width, 44px height
 * - Badge only visible when activeFiltersCount > 0
 *
 * Design Tokens (from PHASE-2.28-DESIGN-TOKENS.md):
 * - Width: 140px
 * - Height: 44px
 * - Background: #ffffff
 * - Border-radius: 0 8px 8px 0 (right-rounded only)
 * - Border-left: 1px solid #e0e0e0
 * - Font: 14px/600 (medium weight)
 * - Badge: 12px/700, black bg, white text
 */

import React, { useCallback, useMemo } from 'react';
import {
  Button,
  Box,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../../store';
import {
  setFiltersOverlayVisible,
} from '../../../../../store/slices/smartSearchSlice';

interface MoreFiltersButtonProps {
  disabled?: boolean;
}

/**
 * More Filters Button Component for Compact Filter Bar
 */
export const MoreFiltersButton: React.FC<MoreFiltersButtonProps> = ({
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

  // Count active advanced filters (bathrooms, parking, etc.)
  // These are stored in smartSearch.filters
  const filters = useSelector((state: RootState) => state.smartSearch.filters);
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters) {
      if (filters.bathrooms?.min) count++;
      if (filters.parking?.min) count++;
      // Add other advanced filter properties as needed
    }
    return count;
  }, [filters]);

  /**
   * Handle More Filters button click
   * Opens FilterDialog (desktop) or FilterDrawer (mobile)
   */
  const handleMoreFiltersClick = useCallback(() => {
    dispatch(setFiltersOverlayVisible(true));
    console.log('[CompactFilterBar.MoreFiltersButton] Opening filters overlay');
  }, [dispatch]);

  return (
    <Box
      sx={{
        width: '140px',
        height: '44px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e0e0e0',
        borderRadius: '0 8px 8px 0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px', // Phase 2.30.6: Match padding of other filter components for proper alignment
        position: 'relative',
      }}
    >
      <Badge
        badgeContent={activeFiltersCount > 0 ? activeFiltersCount : 0}
        color="primary"
        sx={{
          width: '100%', // Phase 2.30.7: Fill parent container width
          height: '100%', // Phase 2.30.7: Fill parent container height
          display: 'flex', // Phase 2.30.7: Enable flex for Badge wrapper
          alignItems: 'center', // Phase 2.30.7: Center Badge content
          justifyContent: 'center', // Phase 2.30.7: Center Badge content
          position: 'relative', // Phase 2.30.7: Position badge indicator relatively

          '& .MuiBadge-badge': {
            position: 'absolute', // Position badge indicator absolutely within Badge
            top: '6px',
            right: '6px',
            backgroundColor: '#0b2d2c',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            minWidth: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            visibility: activeFiltersCount > 0 ? 'visible' : 'hidden',
          },
        }}
      >
        <Button
          onClick={handleMoreFiltersClick}
          disabled={disabled}
          aria-label={`Open more filters dialog, ${activeFiltersCount} filters active`}
          startIcon={<FilterListIcon sx={{ color: '#0b2d2c', fontSize: '20px' }} />}
          sx={{
            flex: 1, // Phase 2.30.6: Use flex to fill available space
            height: '100%',
            backgroundColor: 'transparent',
            color: '#0b2d2c',
            fontSize: '14px',
            fontWeight: 500,
            textTransform: 'none',
            padding: 0,
            gap: '6px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex', // Phase 2.30.6: Ensure button uses flex layout
            alignItems: 'center',
            justifyContent: 'center',

            '&:hover': {
              backgroundColor: '#f5f5f5',
            },

            '&:focus': {
              outline: '2px solid #0b2d2c',
              outlineOffset: '-2px',
            },

            '&:disabled': {
              backgroundColor: 'transparent',
              color: '#999999',
              cursor: 'not-allowed',
            },
          }}
        >
          More Filters
        </Button>
      </Badge>
    </Box>
  );
};

export default MoreFiltersButton;
