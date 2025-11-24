import React, { useState } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Button,
  Fab,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllFilters, performSearch, setFiltersOverlayVisible, selectFiltersOverlayVisible } from '../../../../store/slices/smartSearchSlice';
import type { RootState, AppDispatch } from '../../../../store';
import { useAppSelector } from '../../../../store';
import LocationFilter from './LocationFilter';
import PriceRangeFilter from './PriceRangeFilter';
import BedroomsFilter from './BedroomsFilter';
import BathroomsFilter from './BathroomsFilter';
import ParkingFilter from './ParkingFilter';
import PropertyTypeFilter from './PropertyTypeFilter';
import ListingTypeFilter from './ListingTypeFilter';

interface FilterDrawerProps {}

const FilterDrawer: React.FC<FilterDrawerProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Phase 2.17.4: Connect to Redux state for overlay visibility
  const filtersOverlayVisible = useAppSelector(selectFiltersOverlayVisible);
  const activeFilters = useSelector((state: RootState) => state.smartSearch.activeFilters);
  const loading = useSelector((state: RootState) => state.smartSearch.loading);
  const totalCount = useSelector((state: RootState) => state.smartSearch.totalCount);

  // Phase 2.17.4: Use Redux state for open prop
  const handleOpen = () => dispatch(setFiltersOverlayVisible(true));
  const handleClose = () => dispatch(setFiltersOverlayVisible(false));

  const handleClearAll = () => {
    dispatch(clearAllFilters());
  };

  const handleApply = () => {
    dispatch(performSearch());
    handleClose();
  };

  return (
    <>
      {/* Floating Filter Button (Mobile Only) */}
      <Fab
        color="primary"
        aria-label="filters"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          display: { xs: 'flex', md: 'none' },
          zIndex: 1200,
        }}
      >
        <Badge badgeContent={activeFilters.length} color="error">
          <FilterIcon />
        </Badge>
      </Fab>

      {/* Filter Drawer */}
      {/* Phase 2.17.5 FIX: Changed from mobile-only to always available (for floating filter button) */}
      <Drawer
        anchor="right"
        open={filtersOverlayVisible}
        onClose={handleClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: { xs: '100%', md: 400 },
            maxHeight: { xs: '85vh', md: '100vh' },
            borderTopLeftRadius: { xs: 16, md: 0 },
            borderTopRightRadius: { xs: 16, md: 0 },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? 'Loading...' : `${totalCount.toLocaleString()} properties found`}
              </Typography>
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Filter Components (Scrollable) */}
          <Box sx={{ maxHeight: 'calc(85vh - 200px)', overflow: 'auto', mb: 3 }}>
            <LocationFilter />
            <PriceRangeFilter />
            <BedroomsFilter />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <BathroomsFilter />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ParkingFilter />
              </Box>
            </Box>
            <PropertyTypeFilter />
            <ListingTypeFilter />
          </Box>

          {/* Action Buttons (Fixed at Bottom) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleApply}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Searching...
                </>
              ) : (
                `Show ${totalCount ? totalCount.toLocaleString() : '?'} Results`
              )}
            </Button>
            {activeFilters.length > 0 && (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleClearAll}
                disabled={loading}
              >
                Clear All Filters
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default FilterDrawer;
