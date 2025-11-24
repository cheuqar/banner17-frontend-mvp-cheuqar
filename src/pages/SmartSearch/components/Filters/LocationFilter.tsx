import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setLocationFilter, clearFilter } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';
import SuburbAutocomplete from '../SuburbAutocomplete';
import inputStyles from '../../../../components/filters/FilterInput.module.css';

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' },
];

const LocationFilter: React.FC = () => {
  const dispatch = useDispatch();
  const location = useSelector((state: RootState) => state.smartSearch.filters.location);

  const handleStateChange = (value: string) => {
    dispatch(setLocationFilter({ state: value || null }));
  };

  const handleSuburbAutocompleteChange = (
    suburb: string | null,
    selectedState: string | null,
    postcode: string | null
  ) => {
    // When suburb is selected from autocomplete, update all related fields
    const updates: Record<string, string | null> = { suburb };

    // Auto-populate state if provided and not already set
    if (selectedState && !location.state) {
      updates.state = selectedState;
    }

    // Auto-populate postcode if provided
    if (postcode) {
      updates.postcode = postcode;
    }

    dispatch(setLocationFilter(updates));
  };

  const handleClearState = () => {
    dispatch(setLocationFilter({ state: null }));
  };

  const handleClearSuburb = () => {
    dispatch(setLocationFilter({ suburb: null }));
  };

  const handleClearAll = () => {
    dispatch(clearFilter('location'));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Location
        </Typography>
        {(location.state || location.suburb) && (
          <IconButton size="small" onClick={handleClearAll} sx={{ ml: 1 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* State Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel
          id="state-select-label"
          sx={{
            color: '#666',
            backgroundColor: '#F5F5F5',
            px: 0.5,
            '&.Mui-focused': {
              color: '#0b2d2c',
              backgroundColor: '#FFFFFF',
            },
          }}
        >
          State
        </InputLabel>
        <Select
          labelId="state-select-label"
          value={location.state || ''}
          onChange={(e) => handleStateChange(e.target.value)}
          label="State"
          sx={{
            backgroundColor: '#F5F5F5',
            '&:hover': {
              backgroundColor: '#EBEBEB',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: 'inset 0 0 0 1px #0b2d2c !important',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none !important',
              },
              '& .MuiOutlinedInput-input': {
                outline: 'none !important',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E0E0E0',
            },
            '& .MuiOutlinedInput-input': {
              outline: 'none !important',
            },
          }}
          endAdornment={
            location.state ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearState();
                }}
                sx={{ mr: 2 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        >
          <MenuItem value="">
            <em>Any State</em>
          </MenuItem>
          {AUSTRALIAN_STATES.map((state) => (
            <MenuItem key={state.value} value={state.value}>
              {state.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Suburb Autocomplete */}
      <Box sx={{ mb: 2 }}>
        <SuburbAutocomplete
          value={location.suburb}
          state={location.state}
          onChange={handleSuburbAutocompleteChange}
          disabled={false}
        />
      </Box>

      {/* Postcode Text Input */}
      <TextField
        fullWidth
        label="Postcode"
        placeholder="e.g., 2150"
        value={location.postcode || ''}
        onChange={(e) => {
          const value = e.target.value;
          // Only allow digits and limit to 4 characters
          if (value === '' || (/^\d{0,4}$/.test(value))) {
            dispatch(setLocationFilter({ postcode: value || null }));
          }
        }}
        InputProps={{
          endAdornment: location.postcode ? (
            <IconButton
              size="small"
              onClick={() => dispatch(setLocationFilter({ postcode: null }))}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : null,
        }}
        InputLabelProps={{
          shrink: !!location.postcode,
          sx: {
            color: '#666',
            backgroundColor: '#F5F5F5',
            px: 0.5,
            '&.Mui-focused': {
              color: '#0b2d2c',
              backgroundColor: '#FFFFFF',
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#F5F5F5',
            '&:hover': {
              backgroundColor: '#EBEBEB',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: 'inset 0 0 0 1px #0b2d2c !important',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none !important',
              },
              '& .MuiOutlinedInput-input': {
                outline: 'none !important',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E0E0E0',
            },
          },
          '& .MuiOutlinedInput-input': {
            outline: 'none !important',
          },
        }}
        inputProps={{
          maxLength: 4,
          inputMode: 'numeric',
          pattern: '[0-9]*',
        }}
      />
    </Box>
  );
};

export default LocationFilter;
