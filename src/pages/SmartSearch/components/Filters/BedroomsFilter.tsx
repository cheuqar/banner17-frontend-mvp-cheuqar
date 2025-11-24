import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  IconButton,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setBedroomsFilter, clearFilter } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';
import inputStyles from '../../../../components/filters/FilterInput.module.css';

const BEDROOM_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
];

const BedroomsFilter: React.FC = () => {
  const dispatch = useDispatch();
  const bedrooms = useSelector((state: RootState) => state.smartSearch.filters.bedrooms);
  const [validationError, setValidationError] = React.useState<string>('');

  // Bug #2 Fix: Reset validation error when filters are cleared
  React.useEffect(() => {
    if (bedrooms.min === null && bedrooms.max === null) {
      setValidationError('');
    }
  }, [bedrooms.min, bedrooms.max]);

  const handleMinChange = (value: number | null) => {
    // Validate against max if max is set
    if (value !== null && bedrooms.max !== null && value > bedrooms.max) {
      setValidationError('Minimum bedrooms cannot exceed maximum bedrooms');
      return;
    }

    setValidationError('');
    dispatch(setBedroomsFilter({ min: value }));
  };

  const handleMaxChange = (value: number | null) => {
    // Validate against min if min is set
    if (value !== null && bedrooms.min !== null && value < bedrooms.min) {
      setValidationError('Maximum bedrooms must be greater than or equal to minimum bedrooms');
      return;
    }

    setValidationError('');
    dispatch(setBedroomsFilter({ max: value }));
  };

  const handleClearAll = () => {
    setValidationError('');
    dispatch(clearFilter('bedrooms'));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Bedrooms
        </Typography>
        {(bedrooms.min || bedrooms.max) && (
          <IconButton size="small" onClick={handleClearAll} sx={{ ml: 1 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }} className={inputStyles.filterInputGroup}>
          {/* Min Bedrooms */}
          <FormControl fullWidth error={!!validationError}>
            <InputLabel
              id="bedrooms-min-label"
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
              Min
            </InputLabel>
            <Select
              labelId="bedrooms-min-label"
              value={bedrooms.min ?? ''}
              onChange={(e) => handleMinChange(e.target.value === '' ? null : Number(e.target.value))}
              label="Min"
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
            >
              {BEDROOM_OPTIONS.map((option) => (
                <MenuItem key={option.label} value={option.value ?? ''}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography sx={{ color: 'text.secondary', flexShrink: 0 }} className={inputStyles.filterInputGroupSeparator}>to</Typography>

          {/* Max Bedrooms */}
          <FormControl fullWidth error={!!validationError}>
            <InputLabel
              id="bedrooms-max-label"
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
              Max
            </InputLabel>
            <Select
              labelId="bedrooms-max-label"
              value={bedrooms.max ?? ''}
              onChange={(e) => handleMaxChange(e.target.value === '' ? null : Number(e.target.value))}
              label="Max"
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
            >
              {BEDROOM_OPTIONS.map((option) => (
                <MenuItem key={option.label} value={option.value ?? ''}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {validationError && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
            {validationError}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default BedroomsFilter;
