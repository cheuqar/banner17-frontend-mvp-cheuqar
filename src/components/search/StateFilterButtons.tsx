/**
 * Component: StateFilterButtons
 * 
 * Australian state filter buttons for Smart Search Header Row 2
 * Displays all 8 state abbreviations: NSW, VIC, QLD, SA, WA, TAS, ACT, NT
 * 
 * Features:
 * - Typography variant: body2 (14px per design tokens)
 * - Active state: underline (2px solid #000000)
 * - Font weight: 600 (per MUI theme)
 * - Responsive wrapping on mobile
 */

import React from 'react';
import { Box, Link } from '@mui/material';
import type { StateCode } from '../../types/searchFilters';

interface StateFilterButtonsProps {
  active?: StateCode | null;
  onChange: (state: StateCode | null) => void;
  disabled?: boolean;
  states?: StateCode[];  // Optional custom state list
}

// Default Australian state list
const DEFAULT_STATES: StateCode[] = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

/**
 * StateFilterButtons Component
 * 
 * Displays clickable state filter buttons with active state
 */
export const StateFilterButtons: React.FC<StateFilterButtonsProps> = ({
  active,
  onChange,
  disabled = false,
  states = DEFAULT_STATES,
}) => {
  /**
   * Handle state click
   * Single selection: clicking active state deselects it
   */
  const handleClick = (state: StateCode) => {
    if (!disabled) {
      // Toggle: if clicking active state, deselect it
      const newState = active === state ? null : state;
      onChange(newState);
      console.log('[StateFilterButtons] State filter changed:', newState);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,  // 8px spacing between state buttons (8px * 1)
        alignItems: 'center',
        flexWrap: 'wrap',  // Allow wrapping on mobile
      }}
    >
      {states.map((state) => {
        const isActive = active === state;

        return (
          <Link
            key={state}
            component="button"
            role="button"
            onClick={() => handleClick(state)}
            disabled={disabled}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Filter by ${state}`}
            sx={{
              // Typography: body2 variant (14px)
              fontSize: '14px',  // Smaller than transaction filters
              fontWeight: 600,   // Per MUI theme
              textTransform: 'none',
              color: '#000000',  // Primary text color
              textDecoration: 'none',
              
              // Active state: 2px underline
              ...(isActive && {
                borderBottom: '2px solid #000000',
                fontWeight: 700,
              }),
              
              // Cursor
              cursor: disabled ? 'not-allowed' : 'pointer',
              
              // Minimum dimensions for touch targets (WCAG 2.5.5)
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              padding: '8px 4px',  // Padding to achieve 44px height
              
              // Hover state
              ...(!disabled && {
                '&:hover': {
                  opacity: 0.8,
                  transition: 'opacity 0.3s ease',
                },
              }),
              
              // Disabled state
              ...(disabled && {
                opacity: 0.5,
                color: '#999999',
              }),
            }}
          >
            {state}
          </Link>
        );
      })}
    </Box>
  );
};

export default StateFilterButtons;

