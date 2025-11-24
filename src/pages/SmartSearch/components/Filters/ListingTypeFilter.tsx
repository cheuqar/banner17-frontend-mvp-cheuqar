import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  IconButton,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setListingTypeFilter, clearFilter } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';

const ListingTypeFilter: React.FC = () => {
  const dispatch = useDispatch();
  const listingType = useSelector((state: RootState) => state.smartSearch.filters.listingType);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as 'sale' | 'rent' | '';
    dispatch(setListingTypeFilter(value || null));
  };

  const handleClear = () => {
    dispatch(clearFilter('listingType'));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Listing Type
        </Typography>
        {listingType && (
          <IconButton size="small" onClick={handleClear} sx={{ ml: 1 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <FormControl component="fieldset">
        <RadioGroup value={listingType || ''} onChange={handleChange}>
          <FormControlLabel
            value=""
            control={
              <Radio
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
            label="Any"
          />
          <FormControlLabel
            value="sale"
            control={
              <Radio
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
            label="For Sale"
          />
          <FormControlLabel
            value="rent"
            control={
              <Radio
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
            label="For Rent"
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default ListingTypeFilter;
