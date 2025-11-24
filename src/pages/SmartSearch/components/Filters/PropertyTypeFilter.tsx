import React from 'react';
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setPropertyTypesFilter, clearFilter } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'unit', label: 'Unit' },
  { value: 'land', label: 'Land' },
  { value: 'studio', label: 'Studio' },
];

const PropertyTypeFilter: React.FC = () => {
  const dispatch = useDispatch();
  const propertyTypes = useSelector((state: RootState) => state.smartSearch.filters.propertyTypes);

  const handleToggle = (value: string) => {
    const newTypes = propertyTypes.includes(value)
      ? propertyTypes.filter((type) => type !== value)
      : [...propertyTypes, value];
    dispatch(setPropertyTypesFilter(newTypes));
  };

  const handleClearAll = () => {
    dispatch(clearFilter('propertyTypes'));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Property Type
        </Typography>
        {propertyTypes.length > 0 && (
          <IconButton size="small" onClick={handleClearAll} sx={{ ml: 1 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <FormGroup>
        {PROPERTY_TYPES.map((type) => {
          const isChecked = propertyTypes.includes(type.value);
          return (
            <FormControlLabel
              key={type.value}
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={() => handleToggle(type.value)}
                  inputProps={{ 'aria-label': `${type.label} property type` }}
                  sx={{
                    color: '#666',
                    '&.Mui-checked': {
                      color: '#0b2d2c',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                />
              }
              label={type.label}
            />
          );
        })}
      </FormGroup>
    </Box>
  );
};

export default PropertyTypeFilter;
