/**
 * Component: PropertyTypeSelector (CompactFilterBar)
 *
 * Property type multi-select dropdown for compact filter bar (Phase 2.28.3)
 * Allows selection of one or more property types
 *
 * Features:
 * - Multi-select dropdown with checkboxes
 * - Property type options: House, Apartment, Townhouse, Unit, Land
 * - Display format: Shows first selection or "Multiple" if several selected
 * - 140px width, 44px height
 * - White background (#ffffff) with #e0e0e0 border
 * - Connects to Redux property_type state (array)
 *
 * Design Tokens (from PHASE-2.28-DESIGN-TOKENS.md):
 * - Width: 140px
 * - Height: 44px
 * - Background: #ffffff
 * - Border-left: 1px solid #e0e0e0
 * - Font: 14px/500 (label), 14px/400 (value)
 * - Placeholder: #999999
 */

import React, { useCallback, useMemo } from 'react';
import {
  Select,
  MenuItem,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Box,
  FormControl,
  OutlinedInput,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../../store';
import { setPropertyTypesFilter } from '../../../../../store/slices/smartSearchSlice';

interface PropertyTypeSelectorProps {
  disabled?: boolean;
}

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'unit', label: 'Unit' },
  { value: 'land', label: 'Land' },
];

/**
 * Property Type Selector Component for Compact Filter Bar
 */
export const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const propertyTypes = useSelector((state: RootState) => state.smartSearch.filters.propertyTypes);

  /**
   * Get display label for selected property types
   */
  const displayLabel = useMemo(() => {
    if (!propertyTypes || propertyTypes.length === 0) {
      return 'Property Type';
    }
    if (propertyTypes.length === 1) {
      const selected = PROPERTY_TYPES.find((p) => p.value === propertyTypes[0]);
      return selected?.label || 'Property Type';
    }
    return `${propertyTypes.length} selected`;
  }, [propertyTypes]);

  /**
   * Handle property type selection
   * Toggle selected type in the array
   */
  const handleChange = useCallback(
    (event: any) => {
      const value = event.target.value;
      const newTypes = Array.isArray(value) ? value : [value];
      dispatch(setPropertyTypesFilter(newTypes));
      console.log('[CompactFilterBar.PropertyTypeSelector] Property types changed:', newTypes);
    },
    [dispatch]
  );

  /**
   * Toggle individual property type (for checkbox click)
   */
  const togglePropertyType = useCallback(
    (type: string) => {
      const currentTypes = propertyTypes || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];

      dispatch(setPropertyTypesFilter(newTypes));
      console.log('[CompactFilterBar.PropertyTypeSelector] Property type toggled:', type);
    },
    [propertyTypes, dispatch]
  );

  return (
    <Box
      sx={{
        width: '140px',
        height: '44px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
      }}
    >
      <FormControl size="small" sx={{ width: '100%', height: '100%' }}>
        <Select
          multiple
          value={propertyTypes || []}
          onChange={handleChange}
          disabled={disabled}
          displayEmpty
          aria-label="Property type filter"
          renderValue={() => displayLabel}
          input={
            <OutlinedInput
              sx={{
                height: '44px',
                backgroundColor: 'transparent',
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

                '& .MuiSelect-icon': {
                  right: '26px !important',
                },

                // Ensure text doesn't overflow
                '& .MuiSelect-select': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: '40px !important', // Space for dropdown arrow
                },
              }}
            />
          }
          sx={{
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
          }}
        >
          {PROPERTY_TYPES.map((type) => (
            <MenuItem
              key={type.value}
              value={type.value}
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
              <ListItemIcon
                sx={{
                  minWidth: '32px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Checkbox
                  checked={(propertyTypes || []).includes(type.value)}
                  onChange={() => togglePropertyType(type.value)}
                  size="small"
                  sx={{
                    color: '#0b2d2c',
                    '&.Mui-checked': {
                      color: '#0b2d2c',
                    },
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={type.label}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '14px',
                    color: '#0b2d2c',
                  },
                }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default PropertyTypeSelector;
