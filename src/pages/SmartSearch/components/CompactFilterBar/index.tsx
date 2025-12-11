/**
 * Component: CompactFilterBar (Main Container)
 *
 * Compact inline filter bar for Smart Search header (Phase 2.28.3)
 * Tier 2 of two-tier header redesign (rightmove style)
 * Phase 2.30: Replaced AreaScopeToggle with ApplyButton for mandatory bbox filtering
 *
 * Features:
 * - Black background (#0b2d2c), 64px height, sticky positioning
 * - 6 inline filter components in seamless horizontal layout
 * - Responsive: Desktop 1-row, Tablet 2-row, Mobile stacked
 * - All filters connected to Redux smartSearchSlice state
 * - Phase 2.30: Mandatory bbox filtering (no user control over scope)
 * - No feature flag (direct replacement strategy)
 *
 * Component Structure (Phase 2.30):
 * 1. LocationSearchInput (280px)
 * 2. PriceRangeSelector (240px)
 * 3. BedroomRangeSelector (200px)
 * 4. PropertyTypeSelector (140px)
 * 5. MoreFiltersButton (140px)
 * 6. ApplyButton (100px) - NEW Phase 2.30
 *
 * Design Tokens (from PHASE-2.28-DESIGN-TOKENS.md):
 * - Height: 64px
 * - Background: #0b2d2c
 * - Position: sticky, top: 60px (below TopNavigation)
 * - Z-index: 1100
 * - Padding: 12px 16px (mobile), 12px 24px (tablet), 12px 32px (desktop)
 * - Gap between filters: 0px (seamless)
 *
 * Responsive Breakpoints:
 * - Desktop (>900px): Single row, all filters inline
 * - Tablet (600-900px): 2-row grid layout with adjusted widths
 * - Mobile (<600px): Vertical stack, full width minus padding
 */

import React from 'react';
import { Box } from '@mui/material';

interface CompactFilterBarProps {
  disabled?: boolean;
}

/**
 * Compact Filter Bar Component (Tier 2 of Header)
 * LocationSearchInput has been moved to map top-left position
 */
export const CompactFilterBar: React.FC<CompactFilterBarProps> = ({ disabled = false }) => {
  return (
    <Box
      component="nav"
      aria-label="Property search filters"
      sx={{
        height: 0,
        overflow: 'hidden',
      }}
    />
  );
};

export default CompactFilterBar;
