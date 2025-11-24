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
import { setBathroomsFilter, clearFilter } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';
import inputStyles from '../../../../components/filters/FilterInput.module.css';

const BATHROOM_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
];

const BathroomsFilter: React.FC = () => {
  const dispatch = useDispatch();
  const bathrooms = useSelector((state: RootState) => state.smartSearch.filters.bathrooms);

  const handleChange = (value: number | null) => {
    dispatch(setBathroomsFilter(value));
  };

  const handleClear = () => {
    dispatch(clearFilter('bathrooms'));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Bathrooms
        </Typography>
        {bathrooms.min && (
          <IconButton size="small" onClick={handleClear} sx={{ ml: 1 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <FormControl fullWidth>
        <InputLabel
          id="bathrooms-min-label"
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
          Min Bathrooms
        </InputLabel>
        <Select
          labelId="bathrooms-min-label"
          value={bathrooms.min ?? ''}
          onChange={(e) => handleChange(e.target.value === '' ? null : Number(e.target.value))}
          label="Min Bathrooms"
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
          {BATHROOM_OPTIONS.map((option) => (
            <MenuItem key={option.label} value={option.value ?? ''}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default BathroomsFilter;
