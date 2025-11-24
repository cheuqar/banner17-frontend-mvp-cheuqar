import React from 'react';
import { Button } from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  togglePropertyPanel,
  selectPropertyPanelVisible,
  selectTotalCount,
} from '../../../store/slices/smartSearchSlice';

/**
 * FloatingResultsButton - Phase 2.17.3
 *
 * Displays a floating button showing "{count} results >" when property panel is collapsed.
 * Positioned at top-left of map with z-index 1200 for proper layering.
 *
 * Features:
 * - Conditional rendering: only visible when panel is hidden
 * - Dynamic property count display with locale formatting
 * - Redux-connected: toggles panel on click
 * - Style4-V2 compliant: white background, black text, subtle shadow
 * - Accessibility: ARIA label for screen readers
 */
export const FloatingResultsButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const propertyPanelVisible = useAppSelector(selectPropertyPanelVisible);
  const totalCount = useAppSelector(selectTotalCount);

  // Only show when panel is hidden
  if (propertyPanelVisible) return null;

  const handleClick = () => {
    dispatch(togglePropertyPanel());
  };

  return (
    <Button
      variant="contained"
      onClick={handleClick}
      endIcon={<ChevronRightIcon />}
      aria-label="Show property list panel"
      sx={{
        bgcolor: '#fff',
        color: '#0b2d2c',
        fontWeight: 600,
        fontSize: '0.9rem',
        textTransform: 'none',
        px: 2,
        py: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        '&:hover': {
          bgcolor: '#f5f5f5',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
      }}
    >
      {totalCount.toLocaleString()} results
    </Button>
  );
};

export default FloatingResultsButton;
