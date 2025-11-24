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
import { setParkingFilter, clearFilter } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';
import inputStyles from '../../../../components/filters/FilterInput.module.css';

const PARKING_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
];

const ParkingFilter: React.FC = () => {
  const dispatch = useDispatch();
  const parking = useSelector((state: RootState) => state.smartSearch.filters.parking);

  const handleChange = (value: number | null) => {
    dispatch(setParkingFilter(value));
  };

  const handleClear = () => {
    dispatch(clearFilter('parking'));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Parking Spaces
        </Typography>
        {parking.min && (
          <IconButton size="small" onClick={handleClear} sx={{ ml: 1 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <FormControl fullWidth>
        <InputLabel
          id="parking-min-label"
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
          Min Parking
        </InputLabel>
        <Select
          labelId="parking-min-label"
          value={parking.min ?? ''}
          onChange={(e) => handleChange(e.target.value === '' ? null : Number(e.target.value))}
          label="Min Parking"
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
          {PARKING_OPTIONS.map((option) => (
            <MenuItem key={option.label} value={option.value ?? ''}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ParkingFilter;
