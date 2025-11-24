/**
 * Component: BedroomRangeSelector (CompactFilterBar)
 *
 * Bedroom range min/max dropdown selector for compact filter bar (Phase 2.28.3)
 * Provides two dropdown selectors: Min Beds | "to" | Max Beds
 *
 * Features:
 * - Two dropdown selectors for min and max bedrooms
 * - Separator text "to" between dropdowns
 * - Min/Max validation (max options disabled if < min)
 * - Predefined bedroom options: Any, 1, 2, 3, 4, 5, 6+
 * - 200px total width (100px + "to" + 100px), 44px height
 * - White background (#ffffff) with #e0e0e0 borders
 * - Connects to Redux bedrooms_min and bedrooms_max state
 *
 * Design Tokens (from PHASE-2.28-DESIGN-TOKENS.md):
 * - Width: 200px total (100px min + 100px max)
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
import { setBedroomsFilter } from '../../../../../store/slices/smartSearchSlice';

interface BedroomRangeSelectorProps {
  disabled?: boolean;
}

interface BedroomOption {
  value: number | null;
  label: string;
  disabled?: boolean;
}

const BEDROOM_OPTIONS: BedroomOption[] = [
  { value: null, label: 'Any' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6+' },
];

/**
 * Bedroom Range Selector Component for Compact Filter Bar
 */
export const BedroomRangeSelector: React.FC<BedroomRangeSelectorProps> = ({
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const bedroomsMin = useSelector((state: RootState) => state.smartSearch.filters.bedrooms.min);
  const bedroomsMax = useSelector((state: RootState) => state.smartSearch.filters.bedrooms.max);

  /**
   * Generate max bedroom options
   * Filter out options less than min bedrooms
   */
  const maxBedroomOptions = useMemo(() => {
    if (!bedroomsMin) {
      return BEDROOM_OPTIONS;
    }

    return BEDROOM_OPTIONS.map((option) => ({
      ...option,
      disabled: option.value !== null && option.value < bedroomsMin,
    }));
  }, [bedroomsMin]);

  /**
   * Handle min bedrooms change
   */
  const handleMinChange = useCallback(
    (event: any) => {
      const newMin = event.target.value;
      dispatch(setBedroomsFilter({ min: newMin, max: bedroomsMax }));
      console.log('[CompactFilterBar.BedroomRangeSelector] Min bedrooms changed:', newMin);
    },
    [dispatch, bedroomsMax]
  );

  /**
   * Handle max bedrooms change
   */
  const handleMaxChange = useCallback(
    (event: any) => {
      const newMax = event.target.value;
      dispatch(setBedroomsFilter({ min: bedroomsMin, max: newMax }));
      console.log('[CompactFilterBar.BedroomRangeSelector] Max bedrooms changed:', newMax);
    },
    [dispatch, bedroomsMin]
  );

  return (
    <Box
      sx={{
        width: '200px',
        height: '44px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 0,
      }}
    >
      {/* Min Bedrooms Dropdown */}
      <FormControl size="small" sx={{ flex: 1, height: '100%' }}>
        <Select
          value={bedroomsMin ?? ''}
          onChange={handleMinChange}
          disabled={disabled}
          displayEmpty
          renderValue={(value) => {
            if (!value) return <span style={{ color: '#999999' }}>Min</span>;
            const option = BEDROOM_OPTIONS.find((opt) => opt.value === value);
            return option?.label || 'Min';
          }}
          aria-label="Minimum bedrooms filter"
          sx={{
            width: '100px',
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
          {BEDROOM_OPTIONS.map((option) => (
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

      {/* Max Bedrooms Dropdown */}
      <FormControl size="small" sx={{ flex: 1, height: '100%' }}>
        <Select
          value={bedroomsMax ?? ''}
          onChange={handleMaxChange}
          disabled={disabled}
          displayEmpty
          renderValue={(value) => {
            if (!value) return <span style={{ color: '#999999' }}>Max</span>;
            const option = BEDROOM_OPTIONS.find((opt) => opt.value === value);
            return option?.label || 'Max';
          }}
          aria-label="Maximum bedrooms filter"
          sx={{
            width: '100px',
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
          {maxBedroomOptions.map((option) => (
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

export default BedroomRangeSelector;
