/**
 * Component: PriceRangeSelector (CompactFilterBar)
 *
 * Price range min/max dropdown selector for compact filter bar (Phase 2.28.3)
 * Provides two dropdown selectors: Min Price | "to" | Max Price
 *
 * Features:
 * - Two dropdown selectors for min and max price
 * - Separator text "to" between dropdowns
 * - Min/Max validation (max options disabled if < min)
 * - Predefined price options: Any, $250K, $500K, $750K, $1M, $1.5M, $2M, $3M, $5M
 * - 240px total width (120px + "to" + 120px), 44px height
 * - White background (#ffffff) with #e0e0e0 borders
 * - Connects to Redux price_min and price_max state
 *
 * Design Tokens (from PHASE-2.28-DESIGN-TOKENS.md):
 * - Width: 240px total (120px min + 120px max)
 * - Height: 44px
 * - Background: #ffffff
 * - Border-left: 1px solid #e0e0e0
 * - Separator: 1px #e0e0e0 vertical line
 * - Font: 14px/400
 * - Placeholder: #999999
 */

import React, { useCallback, useMemo } from 'react';
import {
  Select,
  MenuItem,
  Box,
  FormControl,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../../store';
import { setPriceRangeFilter } from '../../../../../store/slices/smartSearchSlice';

interface PriceRangeSelectorProps {
  disabled?: boolean;
}

interface PriceOption {
  value: number | null;
  label: string;
  disabled?: boolean;
}

const PRICE_OPTIONS: PriceOption[] = [
  { value: null, label: 'Any' },
  { value: 250000, label: '$250K' },
  { value: 500000, label: '$500K' },
  { value: 750000, label: '$750K' },
  { value: 1000000, label: '$1M' },
  { value: 1500000, label: '$1.5M' },
  { value: 2000000, label: '$2M' },
  { value: 3000000, label: '$3M' },
  { value: 5000000, label: '$5M' },
];

/**
 * Price Range Selector Component for Compact Filter Bar
 */
export const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const priceMin = useSelector((state: RootState) => state.smartSearch.filters.priceRange.min);
  const priceMax = useSelector((state: RootState) => state.smartSearch.filters.priceRange.max);

  /**
   * Generate max price options
   * Filter out options less than or equal to min price
   */
  const maxPriceOptions = useMemo(() => {
    if (!priceMin) {
      return PRICE_OPTIONS;
    }

    return PRICE_OPTIONS.map((option) => ({
      ...option,
      disabled: option.value !== null && option.value <= priceMin,
    }));
  }, [priceMin]);

  /**
   * Handle min price change
   */
  const handleMinChange = useCallback(
    (event: any) => {
      const newMin = event.target.value;
      dispatch(setPriceRangeFilter({ min: newMin, max: priceMax }));
      console.log('[CompactFilterBar.PriceRangeSelector] Min price changed:', newMin);
    },
    [dispatch, priceMax]
  );

  /**
   * Handle max price change
   */
  const handleMaxChange = useCallback(
    (event: any) => {
      const newMax = event.target.value;
      dispatch(setPriceRangeFilter({ min: priceMin, max: newMax }));
      console.log('[CompactFilterBar.PriceRangeSelector] Max price changed:', newMax);
    },
    [dispatch, priceMin]
  );

  return (
    <Box
      sx={{
        width: '240px',
        height: '44px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 0,
      }}
    >
      {/* Min Price Dropdown */}
      <FormControl size="small" sx={{ flex: 1, height: '100%' }}>
        <Select
          value={priceMin ?? ''}
          onChange={handleMinChange}
          disabled={disabled}
          displayEmpty
          renderValue={(value) => {
            if (!value) return <span style={{ color: '#999999' }}>Min</span>;
            const option = PRICE_OPTIONS.find((opt) => opt.value === value);
            return option?.label || 'Min';
          }}
          aria-label="Minimum price filter"
          sx={{
            width: '120px',
            height: '44px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontWeight: 400,
            color: '#0b2d2c',

            '& .MuiOutlinedInput-notchedOutline': {
              display: 'none',
            },

            '&:hover': {
              backgroundColor: 'transparent',
            },

            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              display: 'none',
            },

            '& .MuiSvgIcon-root': {
              right: '26px !important',
            },

            '& .MuiSelect-icon': {
              right: '26px !important',
            },

            '& .MuiSelect-select': {
              paddingRight: '40px !important',
            },
          }}
        >
          {PRICE_OPTIONS.map((option) => (
            <MenuItem
              key={option.value ?? 'any'}
              value={option.value ?? ''}
              sx={{
                fontSize: '14px',
                color: '#0b2d2c',

                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },

                '&.Mui-selected': {
                  backgroundColor: '#eeeeee',
                },

                '&.Mui-disabled': {
                  color: '#999999',
                  opacity: 0.5,
                },
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Separator */}
      <Box
        sx={{
          px: 1,
          fontSize: '14px',
          fontWeight: 400,
          color: '#666666',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        to
      </Box>

      {/* Max Price Dropdown */}
      <FormControl size="small" sx={{ flex: 1, height: '100%' }}>
        <Select
          value={priceMax ?? ''}
          onChange={handleMaxChange}
          disabled={disabled}
          displayEmpty
          renderValue={(value) => {
            if (!value) return <span style={{ color: '#999999' }}>Max</span>;
            const option = PRICE_OPTIONS.find((opt) => opt.value === value);
            return option?.label || 'Max';
          }}
          aria-label="Maximum price filter"
          sx={{
            width: '120px',
            height: '44px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontWeight: 400,
            color: '#0b2d2c',

            '& .MuiOutlinedInput-notchedOutline': {
              display: 'none',
            },

            '&:hover': {
              backgroundColor: 'transparent',
            },

            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              display: 'none',
            },

            '& .MuiSvgIcon-root': {
              right: '26px !important',
            },

            '& .MuiSelect-icon': {
              right: '26px !important',
            },

            '& .MuiSelect-select': {
              paddingRight: '40px !important',
            },
          }}
        >
          {maxPriceOptions.map((option) => (
            <MenuItem
              key={option.value ?? 'any'}
              value={option.value ?? ''}
              disabled={option.disabled}
              sx={{
                fontSize: '14px',
                color: '#0b2d2c',

                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },

                '&.Mui-selected': {
                  backgroundColor: '#eeeeee',
                },

                '&.Mui-disabled': {
                  color: '#999999',
                  opacity: 0.5,
                },
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default PriceRangeSelector;
