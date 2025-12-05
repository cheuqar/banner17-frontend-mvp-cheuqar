/**
 * Amenities Panel Component
 * Phase 2.32.3 - Amenities Panel UI & Filters
 * ============================================
 *
 * Complete amenities panel with filters and amenity list display.
 * Follows School Panel pattern for consistency.
 *
 * Features:
 * - Category filtering (7 categories)
 * - Search by amenity name
 * - Radius distance filter (1-20 km)
 * - Single-selection amenity management (Phase 2.32.1)
 * - Loading and error states
 * - Style4-V2 design tokens
 */

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  // Phase 2.32.6: Removed Select, MenuItem, FormControl, InputLabel - no radius filter
  Chip,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SchoolIcon from '@mui/icons-material/School';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AttractionsIcon from '@mui/icons-material/Attractions';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SportsIcon from '@mui/icons-material/Sports';
import TrainIcon from '@mui/icons-material/Train';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchAmenities,
  setAmenitySearchQuery,
  setCategoryFilters,
  // Phase 2.32.6: Removed setRadiusKm import - aligned with school markers bbox-only pattern
  setShowAmenitiesOnMap,
  toggleAmenitySelection,
  clearAmenitySelection,
} from '../../../store/slices/smartSearchSlice';
import { selectThemeColors, selectThemeBorder } from '../../../store/slices/themeSlice';
import { AmenityListItem } from '../../../components/smartSearch/AmenityListItem';
import type { Amenity } from '../../../store/slices/smartSearchSlice';
// Phase 2.32.7: Import useDebouncedBounds for robust bounds auto-refresh
import { useDebouncedBounds } from '../../../hooks/useDebouncedBounds';

interface AmenitiesPanelProps {
  /** Optional callback when amenity is centered on map */
  onCenterAmenity?: (amenity: Amenity) => void;
}

/**
 * Category configuration with icons
 */
const AMENITY_CATEGORIES = [
  { value: 'hospitals', label: 'Hospitals', icon: <LocalHospitalIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'libraries', label: 'Libraries', icon: <LocalLibraryIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'shopping', label: 'Shopping', icon: <ShoppingCartIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'universities_tafe', label: 'Universities/TAFE', icon: <SchoolIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'child_care', label: 'Child Care', icon: <ChildCareIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'tourist_attractions', label: 'Tourist Attractions', icon: <AttractionsIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'beaches', label: 'Beaches', icon: <BeachAccessIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'sports', label: 'Sports', icon: <SportsIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'transport_stations', label: 'Transport', icon: <TrainIcon sx={{ fontSize: '1rem' }} /> },
];

// Phase 2.32.6: Removed RADIUS_OPTIONS - aligned with school markers bbox-only pattern

/**
 * Debounce utility function
 */
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * AmenitiesPanel Component
 */
export const AmenitiesPanel: React.FC<AmenitiesPanelProps> = ({ onCenterAmenity }) => {
  const dispatch = useAppDispatch();
  const themeColors = useAppSelector(selectThemeColors);
  const themeBorder = useAppSelector(selectThemeBorder);
  const {
    isLoading,
    error,
    data: amenities,
    selectedAmenityId, // Phase 2.32.1: Single selection
    selectedAmenity, // Phase 2.32.1: Single cached amenity
    searchQuery,
    categoryFilters,
    // Phase 2.32.6: Removed radiusKm - aligned with school markers bbox-only pattern
    showAmenitiesOnMap,
  } = useAppSelector(state => state.smartSearch.amenities);

  // Phase 2.32.7: Access mapBounds and debounce for robust auto-refresh
  const mapBounds = useAppSelector(state => state.smartSearch.mapBounds);
  const debouncedMapBounds = useDebouncedBounds(mapBounds, 800); // 800ms matches schools pattern

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Phase 2.32.7: AbortController for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch amenities when filters or map bounds change
   * Phase 2.32.6: Removed radiusKm from dependencies - bbox-only pattern
   * Phase 2.32.7: Added debouncedMapBounds dependency for robust auto-refresh
   */
  useEffect(() => {
    // Phase 2.32.7: Bounds validation - don't fetch with empty bounds
    if (!debouncedMapBounds) {
      console.log('[AmenitiesPanel] Skipping fetch - no map bounds available');
      return;
    }

    // Phase 2.32.7: Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchAmenitiesData = async () => {
      // Create new AbortController for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await dispatch(fetchAmenities()).unwrap();
      } catch (error: any) {
        // Ignore abort errors (user navigated away or new search started)
        if (error?.name === 'AbortError' || error?.message?.includes('abort')) {
          console.log('[AmenitiesPanel] Request aborted (user action)');
          return;
        }
        toast.error(error || 'Failed to fetch amenities');
      }
    };

    fetchAmenitiesData();

    // Cleanup: abort on unmount or when dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dispatch, debouncedSearchQuery, categoryFilters, debouncedMapBounds]); // Phase 2.32.7: Added debouncedMapBounds

  /**
   * Handle category chip click (toggle)
   */
  const handleCategoryToggle = useCallback((categoryValue: string) => {
    const isSelected = categoryFilters.includes(categoryValue);

    if (isSelected) {
      // Remove category
      dispatch(setCategoryFilters(categoryFilters.filter(c => c !== categoryValue)));
    } else {
      // Add category
      dispatch(setCategoryFilters([...categoryFilters, categoryValue]));
    }
  }, [dispatch, categoryFilters]);

  /**
   * Handle amenity selection
   */
  const handleSelectAmenity = useCallback((amenity: Amenity) => {
    dispatch(toggleAmenitySelection(amenity.id));

    // Auto-center map on the selected amenity
    if (onCenterAmenity && amenity.latitude && amenity.longitude) {
      setTimeout(() => {
        onCenterAmenity(amenity);
      }, 100);
    }
  }, [dispatch, onCenterAmenity]);

  /**
   * Handle amenity deselection
   */
  const handleDeselectAmenity = useCallback((amenityId: string) => {
    dispatch(toggleAmenitySelection(amenityId));
  }, [dispatch]);

  /**
   * Handle center amenity on map
   */
  const handleCenterAmenity = useCallback((amenity: Amenity) => {
    if (onCenterAmenity) {
      onCenterAmenity(amenity);
    }
  }, [onCenterAmenity]);

  /**
   * Check if an amenity is selected
   * Phase 2.32.1: Single selection - just compare with selectedAmenityId
   */
  const isAmenitySelected = useCallback((amenityId: string) => {
    return selectedAmenityId === amenityId;
  }, [selectedAmenityId]);

  /**
   * Clear selection (Phase 2.32.1: Single selection)
   */
  const handleClearAllSelections = useCallback(() => {
    dispatch(clearAmenitySelection());
    toast.info('Amenity selection cleared');
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: themeColors.primaryLight, borderRight: `2px solid ${themeBorder}` }}>


      {/* Filters Section */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
        {/* Search Input */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search amenities..."
          value={searchQuery}
          onChange={(e) => dispatch(setAmenitySearchQuery(e.target.value))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#999', fontSize: '1.2rem' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#e0e0e0' },
              '&:hover fieldset': { borderColor: '#0b2d2c' },
              '&.Mui-focused fieldset': { borderColor: '#0b2d2c' },
            },
          }}
        />

        {/* Phase 2.32.6: Removed Radius Filter - aligned with school markers bbox-only pattern */}

        {/* Category Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {AMENITY_CATEGORIES.map(category => {
            const isSelected = categoryFilters.includes(category.value);
            return (
              <Chip
                key={category.value}
                icon={category.icon}
                label={category.label}
                onClick={() => handleCategoryToggle(category.value)}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.75rem',
                  height: '28px',
                  backgroundColor: isSelected ? '#0b2d2c' : 'transparent',
                  color: isSelected ? '#fff' : '#0b2d2c',
                  borderColor: '#e0e0e0',
                  '&:hover': {
                    backgroundColor: isSelected ? '#333' : '#f5f5f5',
                  },
                  '& .MuiChip-icon': {
                    color: isSelected ? '#fff' : '#666',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Toggle Controls */}
      <Box sx={{ px: 2, py: 0.75, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={showAmenitiesOnMap}
              onChange={(e) => dispatch(setShowAmenitiesOnMap(e.target.checked))}
              size="small"
            />
          }
          label={
            <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
              Show amenities on map
            </Typography>
          }
          sx={{ margin: 0 }}
        />
      </Box>

     

      {/* Results Section */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && amenities.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
              No amenities found
            </Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Try adjusting your filters or search query
            </Typography>
          </Box>
        )}

        {/* Amenity List */}
        {!isLoading && amenities.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
              {amenities.length} amenities found
            </Typography>
            {amenities.map(amenity => (
              <AmenityListItem
                key={amenity.id}
                amenity={amenity}
                isSelected={isAmenitySelected(amenity.id)}
                onSelect={handleSelectAmenity}
                onDeselect={handleDeselectAmenity}
                onCenter={handleCenterAmenity}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
