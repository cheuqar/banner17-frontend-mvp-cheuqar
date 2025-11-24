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
import {
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import LocationSearchInput from './components/LocationSearchInput';
import PriceRangeSelector from './components/PriceRangeSelector';
import BedroomRangeSelector from './components/BedroomRangeSelector';
import PropertyTypeSelector from './components/PropertyTypeSelector';
import MoreFiltersButton from './components/MoreFiltersButton';
import ApplyButton from './components/ApplyButton';

interface CompactFilterBarProps {
  disabled?: boolean;
}

/**
 * Compact Filter Bar Component (Tier 2 of Header)
 */
export const CompactFilterBar: React.FC<CompactFilterBarProps> = ({ disabled = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px
  const isTablet = useMediaQuery(theme.breakpoints.down('md')); // <900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >=900px

  // Desktop layout: Single row, all filters inline
  if (isDesktop) {
    return (
      <Box
        component="nav"
        aria-label="Property search filters"
        sx={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          // Phase 2.28.9 FIX: Center filters horizontally for visual balance with TopNavigation
          // Phase 2.30: Replaced AreaScopeToggle with ApplyButton for mandatory bbox filtering
          // Total filter width ~1040px (280+240+200+140+140+100 + 60px gaps) centered in viewport
          justifyContent: 'center',
          padding: '12px 32px',
          gap: '12px', // 12px gap between all filters
          overflow: 'auto',
          scrollbarWidth: 'none',

          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <LocationSearchInput disabled={disabled} />
        <PriceRangeSelector disabled={disabled} />
        <BedroomRangeSelector disabled={disabled} />
        <PropertyTypeSelector disabled={disabled} />
        <MoreFiltersButton disabled={disabled} />
        <ApplyButton disabled={disabled} />
      </Box>
    );
  }

  // Tablet layout: 2-row grid with adjusted widths
  // Phase 2.30: Removed AreaScopeToggle, added ApplyButton for mandatory bbox filtering
  if (isTablet) {
    return (
      <Box
        component="nav"
        aria-label="Property search filters"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          padding: '12px 24px',
          alignItems: 'center',
        }}
      >
        {/* Row 1: Location full width */}
        <Box sx={{ gridColumn: '1 / 4' }}>
          <LocationSearchInput disabled={disabled} />
        </Box>

        {/* Row 2: Price | Beds | Type */}
        <PriceRangeSelector disabled={disabled} />
        <BedroomRangeSelector disabled={disabled} />
        <PropertyTypeSelector disabled={disabled} />

        {/* Row 3: More Filters | Apply Button (spans 2 columns) */}
        <MoreFiltersButton disabled={disabled} />
        <Box sx={{ gridColumn: '2 / 4' }}>
          <ApplyButton disabled={disabled} />
        </Box>
      </Box>
    );
  }

  // Mobile layout: Vertical stack
  // Phase 2.30: Removed AreaScopeToggle, added ApplyButton for mandatory bbox filtering
  return (
    <Box
      component="nav"
      aria-label="Property search filters"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px 16px',
        alignItems: 'stretch',
      }}
    >
      {/* Full width filters */}
      <LocationSearchInput disabled={disabled} />

      {/* 2-column grid for ranges */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <PriceRangeSelector disabled={disabled} />
        <BedroomRangeSelector disabled={disabled} />
      </Box>

      {/* Full width filters */}
      <PropertyTypeSelector disabled={disabled} />

      {/* 2-column grid for More Filters and Apply button */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <MoreFiltersButton disabled={disabled} />
        <ApplyButton disabled={disabled} />
      </Box>
    </Box>
  );
};

export default CompactFilterBar;
