import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  ListSubheader,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSortBy, performSearch } from '../../../../store/slices/smartSearchSlice';
import type { RootState, AppDispatch } from '../../../../store';

export type SortField =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'updated'
  | 'bedrooms_desc'
  | 'bedrooms_asc'
  | 'land_desc'
  | 'land_asc'
  | 'bathrooms_desc'
  | 'rent_asc'
  | 'rent_desc';

const SortDropdown: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sortBy = useSelector((state: RootState) => state.smartSearch.sortBy);

  const handleChange = (event: { target: { value: string } }) => {
    const value = event.target.value as SortField;
    dispatch(setSortBy(value));
    dispatch(performSearch());
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        Sort By
      </Typography>

      <FormControl fullWidth size="small">
        <Select
          value={sortBy}
          onChange={handleChange}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              py: 1,
            },
          }}
        >
          {/* Tier 1 - Core */}
          <ListSubheader sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
            DATE
          </ListSubheader>
          <MenuItem value="newest">Newest First</MenuItem>
          <MenuItem value="updated">Recently Updated</MenuItem>

          {/* Tier 1 - Price */}
          <ListSubheader sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
            PRICE
          </ListSubheader>
          <MenuItem value="price_asc">Price (Lowest)</MenuItem>
          <MenuItem value="price_desc">Price (Highest)</MenuItem>

          {/* Tier 2 - Extended */}
          <ListSubheader sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
            BEDROOMS
          </ListSubheader>
          <MenuItem value="bedrooms_desc">Most Bedrooms</MenuItem>
          <MenuItem value="bedrooms_asc">Least Bedrooms</MenuItem>

          <ListSubheader sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
            LAND AREA
          </ListSubheader>
          <MenuItem value="land_desc">Largest Land</MenuItem>
          <MenuItem value="land_asc">Smallest Land</MenuItem>

          {/* Tier 3 - Nice-to-Have */}
          <ListSubheader sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary' }}>
            OTHER
          </ListSubheader>
          <MenuItem value="bathrooms_desc">Most Bathrooms</MenuItem>
          <MenuItem value="rent_asc">Lowest Rent</MenuItem>
          <MenuItem value="rent_desc">Highest Rent</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SortDropdown;
