/**
 * Component: TransactionFilters
 * 
 * Transaction filter buttons (Buy/Sell/Sold) for Smart Search Header Row 1
 * Uses Material-UI Link component with button role (Research D4)
 * 
 * Features:
 * - Text-only link buttons (no icons) per FR-011
 * - Active state: underline + color (Research D4)
 * - Font weight: 600 (per MUI theme button default)
 * - Hover state: opacity 0.8 (per Style4-V2 theme)
 * - Typography variant: body1 (16px, weight 400 default, overridden to 600)
 */

import React from 'react';
import { Box, Link } from '@mui/material';
import type { TransactionType } from '../../types/searchFilters';

interface TransactionFiltersProps {
  active?: TransactionType;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
}

/**
 * Transaction Filters Component
 * 
 * Displays Buy/Sell/Sold filter buttons with active state
 */
export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  active,
  onChange,
  disabled = false,
}) => {
  const filters: Array<{ type: TransactionType; label: string }> = [
    { type: 'buy', label: 'Buy' },
    { type: 'sell', label: 'Sell' },
    { type: 'sold', label: 'Sold' },
  ];

  /**
   * Handle filter click
   */
  const handleClick = (type: TransactionType) => {
    if (!disabled) {
      onChange(type);
      console.log('[TransactionFilters] Filter selected:', type);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,  // 24px spacing between buttons (8px * 3)
        alignItems: 'center',
      }}
    >
      {filters.map(({ type, label }) => {
        const isActive = active === type;

        return (
          <Link
            key={type}
            component="button"
            role="button"
            variant="body1"
            onClick={() => handleClick(type)}
            disabled={disabled}
            aria-current={isActive ? 'page' : undefined}
            sx={{
              // Typography
              fontSize: '1rem',  // body1 size
              fontWeight: 600,   // Per MUI theme button default
              textTransform: 'none',  // No auto-uppercase
              color: '#000000',  // Primary text color
              textDecoration: 'none',  // No underline by default
              
              // Cursor
              cursor: disabled ? 'not-allowed' : 'pointer',
              
              // Active state: underline
              ...(isActive && {
                textDecoration: 'underline',
                fontWeight: 700,  // Slightly bolder when active
              }),
              
              // Hover state: opacity change (per Style4-V2)
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
              
              // Transition for smooth state changes
              transition: 'all 0.3s ease',
            }}
          >
            {label}
          </Link>
        );
      })}
    </Box>
  );
};

export default TransactionFilters;

