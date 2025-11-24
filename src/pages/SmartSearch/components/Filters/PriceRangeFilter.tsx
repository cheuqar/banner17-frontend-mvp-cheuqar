import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setPriceRangeFilter, clearFilter } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';
import inputStyles from '../../../../components/filters/FilterInput.module.css';

const PRICE_PRESETS = [
  { label: 'Any', min: null, max: null },
  { label: '<$500K', min: null, max: 500000 },
  { label: '$500K-$1M', min: 500000, max: 1000000 },
  { label: '$1M-$2M', min: 1000000, max: 2000000 },
  { label: '$2M-$5M', min: 2000000, max: 5000000 },
  { label: '$5M+', min: 5000000, max: null },
];

const formatPrice = (value: string): number | null => {
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : null;
};

const displayPrice = (value: number | null): string => {
  if (!value) return '';
  return value.toLocaleString();
};

const PriceRangeFilter: React.FC = () => {
  const dispatch = useDispatch();
  const priceRange = useSelector((state: RootState) => state.smartSearch.filters.priceRange);
  const [validationError, setValidationError] = React.useState<string>('');

  // Bug #2 Fix: Reset validation error when filters are cleared
  React.useEffect(() => {
    if (priceRange.min === null && priceRange.max === null) {
      setValidationError('');
    }
  }, [priceRange.min, priceRange.max]);

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatPrice(event.target.value);

    // Clear error first to allow user to fix invalid ranges
    setValidationError('');

    // Validate against max if max is set (only if both values are set)
    if (value !== null && priceRange.max !== null && value > priceRange.max) {
      setValidationError('Minimum price cannot exceed maximum price');
      // Still dispatch to allow user to fix the range
      dispatch(setPriceRangeFilter({ min: value }));
      return;
    }

    dispatch(setPriceRangeFilter({ min: value }));
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatPrice(event.target.value);

    // Clear error first to allow user to fix invalid ranges
    setValidationError('');

    // Validate against min if min is set (only if both values are set)
    if (value !== null && priceRange.min !== null && value < priceRange.min) {
      setValidationError('Maximum price must be greater than minimum price');
      // Still dispatch to allow user to fix the range
      dispatch(setPriceRangeFilter({ max: value }));
      return;
    }

    dispatch(setPriceRangeFilter({ max: value }));
  };

  const handlePresetClick = (min: number | null, max: number | null) => {
    setValidationError('');
    dispatch(setPriceRangeFilter({ min, max }));
  };

  const handleClearAll = () => {
    setValidationError('');
    dispatch(clearFilter('priceRange'));
  };

  const activePreset = PRICE_PRESETS.find(
    (preset) => preset.min === priceRange.min && preset.max === priceRange.max
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Price Range
        </Typography>
        {(priceRange.min || priceRange.max) && (
          <IconButton size="small" onClick={handleClearAll} sx={{ ml: 1 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Price Presets */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {PRICE_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant={activePreset?.label === preset.label ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handlePresetClick(preset.min, preset.max)}
            sx={{
              minWidth: 'auto',
              px: 2,
              py: 0.5,
              fontSize: '0.875rem',
              textTransform: 'none',
              // Monochrome styling - FR-012, FR-013
              bgcolor: activePreset?.label === preset.label ? '#0b2d2c' : 'transparent',
              color: activePreset?.label === preset.label ? '#fff' : '#0b2d2c',
              border: '1px solid #0b2d2c',
              '&:hover': {
                bgcolor: activePreset?.label === preset.label ? '#333' : '#F5F5F5',
                borderColor: '#0b2d2c',
              },
              transition: 'all 200ms ease',
            }}
          >
            {preset.label}
          </Button>
        ))}
      </Stack>

      {/* Min/Max Inputs */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }} className={inputStyles.filterInputGroup}>
          <TextField
            fullWidth
            label="Min Price"
            placeholder="0"
            value={displayPrice(priceRange.min)}
            onChange={handleMinChange}
            error={!!validationError}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>$</Typography>,
            }}
            InputLabelProps={{
              shrink: true,
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
          />
          <Typography sx={{ color: 'text.secondary', flexShrink: 0 }} className={inputStyles.filterInputGroupSeparator}>to</Typography>
          <TextField
            fullWidth
            label="Max Price"
            placeholder="Any"
            value={displayPrice(priceRange.max)}
            onChange={handleMaxChange}
            error={!!validationError}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>$</Typography>,
            }}
            InputLabelProps={{
              shrink: true,
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
          />
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

export default PriceRangeFilter;
