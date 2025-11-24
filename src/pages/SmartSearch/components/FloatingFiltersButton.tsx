import React from 'react';
import { Button, Badge } from '@mui/material';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  setFiltersOverlayVisible,
  selectPropertyPanelVisible,
  selectFiltersOverlayVisible,
} from '../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../store';

/**
 * FloatingFiltersButton - Phase 2.17.4
 *
 * Displays a floating "Filters" button when property panel is collapsed.
 * Opens FilterDialog overlay on click with optional badge showing active filter count.
 *
 * Features:
 * - Conditional rendering: only visible when panel is hidden
 * - Badge displays active filter count (only if > 0)
 * - Redux-connected: opens filter dialog on click via setFiltersOverlayVisible(true)
 * - Style4-V2 compliant: white background, black text, subtle shadow
 * - Positioned next to FloatingResultsButton with 8px gap (ml: 1)
 * - Accessibility: ARIA label for screen readers
 *
 * Integration (Phase 2.18.2):
 * - Dispatches setFiltersOverlayVisible(true) → FilterDialog opens via Redux state
 */
export const FloatingFiltersButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const propertyPanelVisible = useAppSelector(selectPropertyPanelVisible);
  const activeFilters = useAppSelector((state: RootState) => state.smartSearch.activeFilters);

  // Only show when panel is hidden
  if (propertyPanelVisible) return null;

  const activeFilterCount = activeFilters?.length || 0;

  const handleClick = () => {
    dispatch(setFiltersOverlayVisible(true));
  };

  return (
    <Button
      variant="contained"
      onClick={handleClick}
      startIcon={<FilterListIcon />}
      aria-label="Show filters overlay"
      sx={{
        bgcolor: '#fff',
        color: '#0b2d2c',
        fontWeight: 600,
        fontSize: '0.9rem',
        textTransform: 'none',
        px: 2,
        py: 1,
        // Phase 2.17.5 FIX: Removed ml: 1 (gap handled by parent FloatingMapControls flexbox)
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        '&:hover': {
          bgcolor: '#f5f5f5',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
      }}
    >
      {activeFilterCount > 0 ? (
        <Badge badgeContent={activeFilterCount} color="primary" sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none', ml: 1 } }}>
          <span>Filters</span>
        </Badge>
      ) : (
        'Filters'
      )}
    </Button>
  );
};

export default FloatingFiltersButton;
