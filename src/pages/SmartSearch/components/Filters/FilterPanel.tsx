import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllFilters, performSearch } from '../../../../store/slices/smartSearchSlice';
import type { RootState, AppDispatch } from '../../../../store';
import LocationFilter from './LocationFilter';
import PriceRangeFilter from './PriceRangeFilter';
import BedroomsFilter from './BedroomsFilter';
import BathroomsFilter from './BathroomsFilter';
import ParkingFilter from './ParkingFilter';
import PropertyTypeFilter from './PropertyTypeFilter';
import ListingTypeFilter from './ListingTypeFilter';
import SortDropdown from './SortDropdown';
import styles from '../../../../components/filters/FilterBar.module.css';

interface FilterPanelProps {
  propertyCount?: number;
  loading?: boolean;
  onApplyFilters?: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeFilters = useSelector((state: RootState) => state.smartSearch.activeFilters);
  const loading = useSelector((state: RootState) => state.smartSearch.loading);
  const totalCount = useSelector((state: RootState) => state.smartSearch.totalCount);

  const handleClearAll = () => {
    dispatch(clearAllFilters());
  };

  const handleApply = () => {
    dispatch(performSearch());
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflow: 'auto',
        p: 3,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FilterIcon />
          <Typography variant="h6" fontWeight={700}>
            Filters
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Loading...' : `${totalCount.toLocaleString()} properties found`}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Sort Dropdown */}
      <SortDropdown />
      <Divider sx={{ mb: 3 }} />

      {/* Filter Components */}
      <LocationFilter />
      <Divider sx={{ mb: 3 }} />

      <PriceRangeFilter />
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <BedroomsFilter />
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <BathroomsFilter />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ParkingFilter />
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <PropertyTypeFilter />
      <Divider sx={{ mb: 3 }} />

      <ListingTypeFilter />
      <Divider sx={{ mb: 3 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleApply}
          disabled={loading}
          className={styles.applyButton}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Searching...
            </>
          ) : (
            `Apply Filters${totalCount ? ` (${totalCount.toLocaleString()})` : ''}`
          )}
        </Button>
        {activeFilters.length > 0 && (
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClearAll}
            disabled={loading}
            className={styles.clearButton}
          >
            Clear All Filters
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default FilterPanel;
