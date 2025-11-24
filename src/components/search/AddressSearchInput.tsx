/**
 * Component: AddressSearchInput
 * 
 * Address search input with autocomplete dropdown for Smart Search Header (Feature 003)
 * Replicates Address Research panel styling for consistency (Research D2)
 * 
 * Features:
 * - Material-UI Autocomplete + TextField (outlined, small size)
 * - Debounced search (200ms)
 * - State detection for Q1 auto-clear logic
 * - 44px height for WCAG touch targets
 * - Focus border: 2px #000000 with 2px offset
 */

import React from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import type { AddressSuggestion, StateCode } from '../../types/searchFilters';
import { useAddressAutocomplete } from '../../hooks/useAddressAutocomplete';

interface AddressSearchInputProps {
  placeholder?: string;
  onAddressSelect?: (address: string, state?: StateCode) => void;
  onStateDetected?: (state: StateCode) => void;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
}

/**
 * Address Search Input Component
 */
export const AddressSearchInput: React.FC<AddressSearchInputProps> = ({
  placeholder = 'Search address, suburb, or postcode',
  onAddressSelect,
  onStateDetected,
  disabled = false,
  defaultValue = '',
  className,
}) => {
  const {
    suggestions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    handleSuggestionSelect,
  } = useAddressAutocomplete({
    debounceMs: 200,
    onStateDetected,
  });

  /**
   * Handle suggestion selection
   */
  const handleSelect = (_event: React.SyntheticEvent, value: AddressSuggestion | null | string) => {
    // Value can be string (from freeSolo) or AddressSuggestion object or null
    if (value && typeof value === 'object') {
      handleSuggestionSelect(value);

      // Call parent callback with address and state
      if (onAddressSelect) {
        onAddressSelect(value.label, value.state);
      }
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSearchQuery(newValue);
  };

  return (
    <Autocomplete
      className={className}
      freeSolo
      disabled={disabled}
      loading={loading}
      options={suggestions}
      getOptionLabel={(option) => {
        // Option can be string (freeSolo) or AddressSuggestion object
        return typeof option === 'string' ? option : option.label;
      }}
      inputValue={searchQuery}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          sx={{
            // Height: 44px for WCAG touch targets
            '& .MuiInputBase-root': {
              height: '44px',
              backgroundColor: '#ffffff',
            },
            '& .MuiInputBase-input': {
              color: '#000000',  // Primary text color
              fontSize: '1rem',
              padding: '10px 12px',
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#999999',  // Placeholder color (secondary-light)
              opacity: 1,
            },
            // Border styling
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',  // Material-UI default
            },
            // Focus border: 2px #000000 with 2px offset
            '& .MuiOutlinedInput-root.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000',
                borderWidth: '2px',
              },
              outline: '2px solid #000000',
              outlineOffset: '2px',
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
            minHeight: '44px',  // WCAG touch target
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '&[aria-selected="true"]': {
              backgroundColor: '#eeeeee',
            },
          }}
        >
          <Typography variant="body1" sx={{ color: '#000000', fontWeight: 600 }}>
            {option.address}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
            {option.state} • {option.postcode} {option.type ? `• ${option.type}` : ''}
          </Typography>
        </Box>
      )}
      sx={{
        width: '100%',
        maxWidth: '600px',
      }}
      componentsProps={{
        popper: {
          sx: {
            '& .MuiAutocomplete-paper': {
              elevation: 3,  // Material-UI Paper elevation
              marginTop: '4px',  // 4px gap from input
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

export default AddressSearchInput;

