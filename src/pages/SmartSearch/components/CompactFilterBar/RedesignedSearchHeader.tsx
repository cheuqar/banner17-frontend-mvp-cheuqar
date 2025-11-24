/**
 * Component: RedesignedSearchHeader
 *
 * New two-tier header combining TopNavigation (Tier 1) + CompactFilterBar (Tier 2)
 * Phase 2.28 redesign replacing Feature 003 SearchHeader (rightmove style)
 *
 * Features:
 * - Tier 1 (TopNavigation): White background, 60px, brand + navigation + sign in
 * - Tier 2 (CompactFilterBar): Black background, 64px, inline filters
 * - Total height: 124px
 * - Sticky positioning with proper z-indexing
 * - No feature flag (direct replacement strategy)
 *
 * This component replaces:
 * - SearchHeader.tsx (Feature 003 old header)
 * - SearchHeaderRow1.tsx
 * - SearchHeaderRow2.tsx
 *
 * Integrates:
 * - TopNavigation (Phase 2.28.2)
 * - CompactFilterBar (Phase 2.28.3)
 */

import React from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../../../../store';
import { selectThemeColors } from '../../../../store/slices/themeSlice';
import TopNavigation from '../TopNavigation';
import CompactFilterBar from './index';

interface RedesignedSearchHeaderProps {
  className?: string;
}

/**
 * Redesigned Search Header Component (Phase 2.28)
 *
 * Replaces old Feature 003 SearchHeader with two-tier layout:
 * Tier 1: TopNavigation (white, brand + navigation)
 * Tier 2: CompactFilterBar (black, inline filters)
 *
 * Phase 2.30.1 FIX: Two-layer background architecture
 *
 * ARCHITECTURE PATTERN:
 * Each tier has:
 * - Outer Box: Full-width background color, sticky positioning, z-index
 * - Inner Box: Max-width 1420px content constraint, centered
 * - Child Component: No background/positioning (inherited from parent)
 *
 * This ensures backgrounds extend 100% viewport width while content
 * is constrained to 1420px max-width for optimal readability.
 *
 * Example: On 3440px ultra-wide display:
 * - Black background spans full 3440px width
 * - Filter content centered within 1420px constraint
 * - No white gaps on sides
 */
export const RedesignedSearchHeader: React.FC<RedesignedSearchHeaderProps> = ({ className }) => {
  const themeColors = useAppSelector(selectThemeColors);

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        zIndex: 1100,
      }}
    >
      {/* Tier 1: TopNavigation - Full-width background */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: themeColors.primaryLight,
          borderBottom: '1px solid #e0e0e0',
          position: 'sticky',
          top: 0,
          zIndex: 1101, // Above CompactFilterBar
        }}
      >
        <TopNavigation />
      </Box>

      {/* Tier 2: CompactFilterBar - Full-width dark background */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: themeColors.primaryDark,
          position: 'sticky',
          top: '60px',
          zIndex: 1100,
        }}
      >
        <Box
          sx={{
            maxWidth: '1420px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <CompactFilterBar />
        </Box>
      </Box>
    </Box>
  );
};

export default RedesignedSearchHeader;
