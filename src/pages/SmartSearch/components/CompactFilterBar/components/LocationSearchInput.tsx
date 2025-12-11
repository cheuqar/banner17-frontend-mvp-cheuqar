/**
 * Component: LocationSearchInput (CompactFilterBar)
 *
 * Location search input with autocomplete for compact filter bar (Phase 2.28.3)
 * Adapted from AddressSearchInput for 280px × 44px compact layout
 *
 * Features:
 * - Material-UI Autocomplete + TextField
 * - Debounced search (300ms)
 * - Clear (X) button for instant reset
 * - 280px width, 44px height, left-rounded (8px 0 0 8px)
 * - White background (#ffffff) with #e0e0e0 border
 * - Connects to Redux location state (suburb, state, postcode)
 *
 * Design Tokens (from PHASE-2.28-DESIGN-TOKENS.md):
 * - Width: 280px
 * - Height: 44px (with 12px vertical padding in container)
 * - Background: #ffffff
 * - Border: 1px solid #e0e0e0
 * - Border-radius: 8px 0 0 8px (left-rounded only)
 * - Font: 14px/400
 * - Placeholder: #999999
 * - Focus outline: 2px solid #0b2d2c
 */

import React, { useState, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../../store';
import { setLocationFilter } from '../../../../../store/slices/smartSearchSlice';
import type { AddressSuggestion, StateCode } from '../../../../../types/searchFilters';
import { useAddressAutocomplete } from '../../../../../hooks/useAddressAutocomplete';

interface LocationSearchInputProps {
  placeholder?: string;
  disabled?: boolean;
  fullRounded?: boolean;
}

/**
 * Location Search Input Component for Compact Filter Bar
 */
export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  placeholder = 'Search location...',
  disabled = false,
  fullRounded = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useSelector((state: RootState) => state.smartSearch.filters.location);
  const [displayValue, setDisplayValue] = useState('');

  const {
    suggestions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    handleSuggestionSelect,
  } = useAddressAutocomplete({
    debounceMs: 300,
    onStateDetected: undefined, // Not needed for compact bar
  });

  /**
   * Handle suggestion selection
   * Update Redux state with selected location
   */
  const handleSelect = useCallback(
    (_event: React.SyntheticEvent, value: AddressSuggestion | null | string) => {
      if (value && typeof value === 'object') {
        handleSuggestionSelect(value);
        setDisplayValue(value.label);

        // Dispatch location update to Redux
        dispatch(
          setLocationFilter({
            suburb: value.address,
            state: value.state,
            postcode: value.postcode,
          })
        );

        console.log('[CompactFilterBar.LocationSearchInput] Location selected:', {
          suburb: value.address,
          state: value.state,
          postcode: value.postcode,
        });
      }
    },
    [handleSuggestionSelect, dispatch]
  );

  /**
   * Handle input change
   * Update display value and trigger autocomplete
   */
  const handleInputChange = useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      setSearchQuery(newValue);
      setDisplayValue(newValue);
    },
    [setSearchQuery]
  );

  /**
   * Handle clear button click
   * Reset location and search query
   */
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setDisplayValue('');
    dispatch(
      setLocationFilter({
        suburb: null,
        state: null,
        postcode: null,
      })
    );
    console.log('[CompactFilterBar.LocationSearchInput] Location cleared');
  }, [setSearchQuery, dispatch]);

  return (
    <Autocomplete
      freeSolo
      disabled={disabled}
      loading={loading}
      options={suggestions}
      getOptionLabel={(option) => {
        return typeof option === 'string' ? option : option.label;
      }}
      inputValue={displayValue}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          error={!!error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={16} />
                ) : displayValue ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClear}
                      edge="end"
                      aria-label="clear location search"
                      sx={{
                        color: '#666666',
                        padding: '4px',
                        '&:hover': {
                          color: '#0b2d2c',
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: '18px' }} />
                    </IconButton>
                  </InputAdornment>
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          sx={{
            // Design tokens from PHASE-2.28-DESIGN-TOKENS.md
            width: '280px',
            '& .MuiInputBase-root': {
              height: '44px',
              backgroundColor: '#ffffff',
              borderRadius: fullRounded ? '8px' : '8px 0 0 8px',
              fontSize: '14px',
            },
            '& .MuiInputBase-input': {
              color: '#0b2d2c',
              fontSize: '14px',
              fontWeight: 400,
              padding: '10px 12px',
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#999999',
              opacity: 1,
            },
            // Border styling
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',
              borderWidth: '1px',
            },
            // Hover state
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',
            },
            // Focus border: 2px #0b2d2c outline
            '& .MuiOutlinedInput-root.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0b2d2c',
                borderWidth: '2px',
              },
            },
            // Error state
            '& .Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d32f2f',
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '8px 12px',
            minHeight: '44px',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '&[aria-selected="true"]': {
              backgroundColor: '#eeeeee',
            },
          }}
        >
          <Typography variant="body1" sx={{ color: '#0b2d2c', fontWeight: 500, fontSize: '14px' }}>
            {option.address}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#666666', fontSize: '12px', marginTop: '2px' }}
          >
            {option.state} • {option.postcode}
          </Typography>
        </Box>
      )}
      componentsProps={{
        popper: {
          sx: {
            '& .MuiAutocomplete-paper': {
              marginTop: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            '& .MuiAutocomplete-listbox': {
              padding: 0,
            },
          },
        },
      }}
    />
  );
};

export default LocationSearchInput;
