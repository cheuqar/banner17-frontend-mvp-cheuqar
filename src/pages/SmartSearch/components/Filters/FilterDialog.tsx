import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store';
import {
  clearAllFilters,
  performSearch,
  setFiltersOverlayVisible,
  selectFiltersOverlayVisible,
} from '../../../../store/slices/smartSearchSlice';

// Import filter components
import LocationFilter from './LocationFilter';
import PriceRangeFilter from './PriceRangeFilter';
import BedroomsFilter from './BedroomsFilter';
import BathroomsFilter from './BathroomsFilter';
import ParkingFilter from './ParkingFilter';
import PropertyTypeFilter from './PropertyTypeFilter';
import ListingTypeFilter from './ListingTypeFilter';
import styles from '../../../../components/filters/FilterBar.module.css';

/**
 * FilterDialog - Phase 2.18.1
 *
 * Dialog popup for property filters, replacing FilterDrawer.
 * Opened by both FloatingFiltersButton and LeftPanel inline button.
 *
 * Features:
 * - Responsive: fullScreen on mobile, centered on desktop
 * - Style4-V2 compliant: white/black/gray palette
 * - Redux-connected: uses filtersOverlayVisible state
 * - Contains all 7 filter components
 * - Action buttons: Apply Filters, Clear All
 * - Close handlers: backdrop, button, Escape key
 */
export const FilterDialog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

  // Redux state
  const open = useSelector(selectFiltersOverlayVisible);
  const activeFilters = useSelector((state: RootState) => state.smartSearch.activeFilters);
  const loading = useSelector((state: RootState) => state.smartSearch.loading);
  const totalCount = useSelector((state: RootState) => state.smartSearch.totalCount);
  // Phase 2.22 FIX: Disable Apply Filters button when search is in progress
  const searchPending = useSelector((state: RootState) => state.smartSearch.searchPending);

  // Close handlers
  const handleClose = () => {
    dispatch(setFiltersOverlayVisible(false));
  };

  const handleApply = () => {
    dispatch(performSearch());
    handleClose();
  };

  const handleClearAll = () => {
    dispatch(clearAllFilters());
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      aria-labelledby="filter-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: '#fff',
          color: '#0b2d2c',
          // Override all MUI label colors to monochrome
          '& .MuiInputLabel-root': {
            color: '#666',
            '&.Mui-focused': {
              color: '#0b2d2c',
            },
          },
          '& .MuiFormLabel-root': {
            color: '#666',
            '&.Mui-focused': {
              color: '#0b2d2c',
            },
          },
        },
      }}
    >
      {/* Dialog Title with Close Button */}
      <DialogTitle
        id="filter-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading...' : `${totalCount.toLocaleString()} properties found`}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          aria-label="Close filter dialog"
          sx={{
            color: '#0b2d2c',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#e5e5e5' }} />

      {/* Dialog Content with Filters */}
      <DialogContent
        sx={{
          p: 3,
          overflow: 'auto',
        }}
      >
        {/* Filter Components */}
        <LocationFilter />
        <Divider sx={{ my: 2, borderColor: '#e5e5e5' }} />

        <PriceRangeFilter />
        <Divider sx={{ my: 2, borderColor: '#e5e5e5' }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <BedroomsFilter />
          </Box>
        </Box>
        <Divider sx={{ my: 2, borderColor: '#e5e5e5' }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <BathroomsFilter />
          </Box>
          <Box sx={{ flex: 1 }}>
            <ParkingFilter />
          </Box>
        </Box>
        <Divider sx={{ my: 2, borderColor: '#e5e5e5' }} />

        <PropertyTypeFilter />
        <Divider sx={{ my: 2, borderColor: '#e5e5e5' }} />

        <ListingTypeFilter />
      </DialogContent>

      <Divider sx={{ borderColor: '#e5e5e5' }} />

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          flexDirection: 'column',
        }}
      >
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleApply}
          disabled={loading || searchPending}
          className={styles.applyButton}
        >
          {loading || searchPending ? 'Searching...' : `Apply Filters${totalCount ? ` (${totalCount.toLocaleString()})` : ''}`}
        </Button>
        {activeFilters.length > 0 && (
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClearAll}
            disabled={loading || searchPending}
            className={styles.clearButton}
          >
            Clear All Filters
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
