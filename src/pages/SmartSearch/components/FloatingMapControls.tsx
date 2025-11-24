import React from 'react';
import { Box } from '@mui/material';
import FloatingResultsButton from './FloatingResultsButton';
import FloatingFiltersButton from './FloatingFiltersButton';
import { useAppSelector } from '../../../store';
import { selectPropertyPanelVisible } from '../../../store/slices/smartSearchSlice';

/**
 * FloatingMapControls - Phase 2.17.5
 *
 * Wrapper component for floating buttons (results + filters).
 * Displayed at top-left of map when property panel is collapsed.
 *
 * Features:
 * - Conditional rendering: only visible when panel is hidden
 * - Horizontal flexbox layout with 8px gap between buttons
 * - Positioned absolutely at top-left (16px, 16px)
 * - z-index: 1200 for proper layering above map controls
 * - Accessibility: toolbar role for screen readers
 *
 * Components:
 * - FloatingResultsButton: Shows "{count} results >" to reopen panel
 * - FloatingFiltersButton: Shows "Filters" to open FilterDrawer overlay
 */
export const FloatingMapControls: React.FC = () => {
  const propertyPanelVisible = useAppSelector(selectPropertyPanelVisible);

  // Only show when panel is hidden
  if (propertyPanelVisible) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1200,
        display: 'flex',
        gap: 1, // 8px gap between buttons
        // Phase 2.17.6: Hide on mobile/tablet (<1024px)
        '@media (max-width: 1023px)': {
          display: 'none',
        },
      }}
      role="toolbar"
      aria-label="Floating map controls"
    >
      <FloatingResultsButton />
      <FloatingFiltersButton />
    </Box>
  );
};

export default FloatingMapControls;
