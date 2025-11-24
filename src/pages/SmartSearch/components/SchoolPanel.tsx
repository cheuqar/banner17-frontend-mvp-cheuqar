/**
 * School Panel Component - Integrated with New UI
 * Phase 2.10.7.3 - School Panel UI - Filters & Autocomplete
 * =====================================================
 *
 * Complete school panel with filters, autocomplete, and school list display.
 * Integrates SchoolFilters and SchoolListItem components.
 *
 * Features:
 * - Advanced filtering with autocomplete
 * - Real-time search results display
 * - Selection management (max 3 schools)
 * - Loading and error states
 * - Responsive design
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  selectSchool,
  deselectSchool,
  setSearchResults,
  setLoading,
  setError,
  clearError,
} from '../../../store/slices/smartSearch/schoolPanelSlice';
import {
  setShowSchoolsOnMap,
  setShowCatchmentRadius,
  selectShowSchoolsOnMap,
  selectShowCatchmentRadius,
  performSearch,
  computeSchoolCatchmentUnion,
  setActiveSpatialFilter,
  selectSearchPending,
} from '../../../store/slices/smartSearchSlice';
import { selectThemeColors, selectThemeBorder } from '../../../store/slices/themeSlice';
import { MAX_SELECTED_SCHOOLS } from '../../../types/smartSearch';
import { SchoolFilters } from '../../../components/smartSearch/SchoolFilters';
import { SchoolListItem } from '../../../components/smartSearch/SchoolListItem';
import type { School } from '../../../types/smartSearch';

interface SchoolPanelProps {
  /** Optional callback when school is centered on map */
  onCenterSchool?: (school: School) => void;
}

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
 * SchoolPanel Component
 */
export const SchoolPanel: React.FC<SchoolPanelProps> = ({ onCenterSchool }) => {
  const dispatch = useAppDispatch();
  const themeColors = useAppSelector(selectThemeColors);
  const themeBorder = useAppSelector(selectThemeBorder);
  const filters = useAppSelector(state => state.schoolPanel.filters);
  const searchResults = useAppSelector(state => state.schoolPanel.searchResults);
  const selectedSchools = useAppSelector(state => state.schoolPanel.selectedSchools);
  const loading = useAppSelector(state => state.schoolPanel.loading);
  const error = useAppSelector(state => state.schoolPanel.error);

  // Phase 2.12.1: New toggle controls for school panel visibility
  const showSchoolsOnMap = useAppSelector(selectShowSchoolsOnMap);
  const showCatchmentRadius = useAppSelector(selectShowCatchmentRadius);

  // Phase 2.22 FIX: Get searchPending state to disable controls during search
  const searchPending = useAppSelector(state => state.smartSearch.searchPending);

  // Phase 2.20 BUG FIX: Select map state to preserve bbox when toggle OFF
  const userDefinedMapArea = useAppSelector(state => state.smartSearch.userDefinedMapArea);
  const searchBounds = useAppSelector(state => state.smartSearch.searchBounds);

  // Phase 2.28.7 FIX: Track current spatial filter to prevent unnecessary updates
  const activeSpatialFilter = useAppSelector(state => state.smartSearch.activeSpatialFilter);

  // Phase 2.28.7 FIX: Serialize searchBounds to prevent infinite re-renders
  // Objects create new references on every Redux update, causing useEffect to trigger infinitely
  const searchBoundsKey = useMemo(
    () => searchBounds ? JSON.stringify(searchBounds) : 'null',
    [searchBounds]
  );

  // Phase 2.17.1: Create stable dependency for selected school IDs (for useEffect)
  // Prevents infinite loops by memoizing the ID string
  const selectedSchoolIds = useMemo(
    () => selectedSchools.map(s => s.school_id).join(','),
    [selectedSchools]
  );

  // Debounce filter changes to reduce API calls
  const debouncedFilters = useDebounce(filters, 500);

  // Phase 2.20: Debounce school selection changes for auto-search
  const debouncedSelectedSchoolIds = useDebounce(selectedSchoolIds, 800);

  /**
   * Perform filtered search on filter changes
   */
  const performFilteredSearch = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';

      // Build query parameters
      const params = new URLSearchParams();

      // Add basic filters
      // Phase 2.12.5 FIX: Use 'query' parameter to match backend API (school_service.py line 82)
      if (debouncedFilters.schoolName) {
        params.append('query', debouncedFilters.schoolName);
      }
      if (debouncedFilters.selectiveSchool) {
        params.append('selective_school', debouncedFilters.selectiveSchool);
      }

      // Add multi-select filters (FIX: Use singular names to match backend expectations)
      debouncedFilters.educationLevels.forEach(level => {
        params.append('education_level', level);
      });
      debouncedFilters.schoolTypes.forEach(type => {
        params.append('school_type', type);
      });
      debouncedFilters.genders.forEach(gender => {
        params.append('gender', gender);
      });
      debouncedFilters.denominations.forEach(denom => {
        params.append('denomination', denom);
      });

      // Add boolean filters
      if (debouncedFilters.opportunityClass) {
        params.append('opportunity_class', 'true');
      }
      if (debouncedFilters.boardingSchool) {
        params.append('boarding_school', debouncedFilters.boardingSchool);
      }
      if (debouncedFilters.specialNeeds) {
        params.append('special_needs', 'true');
      }

      const response = await fetch(
        `${baseUrl}/api/v1/smart-search/schools/filtered?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }

      const data = await response.json();
      dispatch(setSearchResults(data.schools || []));
    } catch (err) {
      console.error('School search error:', err);
      dispatch(setError('Failed to search schools'));
      dispatch(setSearchResults([]));
    } finally {
      dispatch(setLoading(false));
    }
  }, [debouncedFilters, dispatch]);

  /**
   * Perform search when filters change
   */
  useEffect(() => {
    performFilteredSearch();
  }, [performFilteredSearch]);

  /**
   * Phase 2.14 FIX: Compute catchment union and trigger property search when toggle changes
   * Phase 2.17 FIX: Handle schools without catchment boundaries (use radius fallback)
   * Phase 2.17.1 FIX: Watch actual selected school IDs, not just length (map marker bug)
   * When schools are selected AND toggle is ON, must compute union BEFORE filtering properties
   */
  useEffect(() => {
    const handleCatchmentToggleChange = async () => {
      if (selectedSchools.length > 0) {
        if (showCatchmentRadius) {
          // Phase 2.17 FIX: Check if selected schools have catchment boundaries
          const schoolsWithBoundaries = selectedSchools.filter(s => s.has_catchment_boundary);

          console.log('[SchoolPanel] Catchment toggle ON:', {
            totalSelected: selectedSchools.length,
            selectedSchoolIds: selectedSchools.map(s => s.school_id),
            withBoundaries: schoolsWithBoundaries.length,
            withoutBoundaries: selectedSchools.length - schoolsWithBoundaries.length
          });

          // Phase 2.28.7 FIX: Only update spatial filter if it actually changed
          // Prevents infinite loops when toggle is ON
          const targetFilter = 'schoolCatchment';
          const needsFilterUpdate = activeSpatialFilter !== targetFilter;

          if (schoolsWithBoundaries.length > 0) {
            // Schools have official catchment boundaries: compute union
            console.log('[SchoolPanel] Computing catchment union for', schoolsWithBoundaries.length, 'schools with boundaries');
            const result = await dispatch(computeSchoolCatchmentUnion());

            if (computeSchoolCatchmentUnion.fulfilled.match(result)) {
              console.log('[SchoolPanel] Catchment union computed successfully', {
                currentFilter: activeSpatialFilter,
                targetFilter,
                needsFilterUpdate
              });

              // Only update filter and search if changed
              if (needsFilterUpdate) {
                console.log('[SchoolPanel] Spatial filter changed to schoolCatchment, updating');
                dispatch(setActiveSpatialFilter('schoolCatchment'));
                // Trigger property search with catchment polygon
                await dispatch(performSearch());
              } else {
                console.log('[SchoolPanel] Spatial filter already schoolCatchment, skipping update');
              }

              // PHASE 2.28: Notify if any schools use radius fallback
              const schoolsUsingRadius = selectedSchools.length - schoolsWithBoundaries.length;
              if (schoolsUsingRadius > 0) {
                toast.info(`${schoolsUsingRadius} school${schoolsUsingRadius > 1 ? 's' : ''} using 3km radius search (no official catchment data)`, {
                  position: 'bottom-right',
                  autoClose: 4000,
                });
              }
            } else {
              console.error('[SchoolPanel] Failed to compute catchment union');
              dispatch(setError('Failed to compute school catchment areas'));
            }
          } else {
            // Phase 2.28: All selected schools lack official boundaries - use radius fallback
            console.log('[SchoolPanel] No schools with catchment boundaries - using radius fallback (3km circles)', {
              currentFilter: activeSpatialFilter,
              targetFilter,
              needsFilterUpdate
            });

            // Only update filter and search if changed
            if (needsFilterUpdate) {
              console.log('[SchoolPanel] Spatial filter changed to schoolCatchment (radius mode), updating');
              dispatch(setActiveSpatialFilter('schoolCatchment'));

              // PHASE 2.28: Notify user that radius mode is active
              toast.info(`${selectedSchools.length} school${selectedSchools.length > 1 ? 's' : ''} using 3km radius search (no official catchment data)`, {
                position: 'bottom-right',
                autoClose: 4000,
              });

              // Backend will detect missing boundaries and use radius circles automatically
              await dispatch(performSearch());
            } else {
              console.log('[SchoolPanel] Spatial filter already schoolCatchment (radius mode), skipping update');
            }
          }
        } else {
          // Toggle is OFF: Use bbox if map has been moved, otherwise clear all spatial filters
          console.log('[SchoolPanel] Catchment toggle OFF - checking map state', {
            userDefinedMapArea,
            hasSearchBounds: !!searchBounds
          });

          // Check if user has defined a map area (manually moved/zoomed map)
          const hasMapArea = userDefinedMapArea && searchBounds;

          // Phase 2.28.7 FIX: Only update spatial filter if it actually changed
          // Prevents infinite loops from unnecessary state updates
          const targetFilter = hasMapArea ? 'bbox' : 'none';

          if (hasMapArea) {
            // Map has been moved/zoomed: use bbox spatial filter to preserve map bounds
            console.log('[SchoolPanel] Map area defined, switching to bbox spatial filter', {
              bounds: searchBounds,
              currentFilter: activeSpatialFilter,
              targetFilter
            });
          } else {
            // No map area defined: clear all spatial filters
            console.log('[SchoolPanel] No map area defined, clearing all spatial filters', {
              currentFilter: activeSpatialFilter,
              targetFilter
            });
          }

          // Only dispatch if filter actually needs to change
          if (activeSpatialFilter !== targetFilter) {
            console.log('[SchoolPanel] Spatial filter changed, updating:', { from: activeSpatialFilter, to: targetFilter });
            dispatch(setActiveSpatialFilter(targetFilter));
            await dispatch(performSearch());
          } else {
            console.log('[SchoolPanel] Spatial filter unchanged, skipping update');
          }
        }
      }
    };

    handleCatchmentToggleChange();
    // Phase 2.17.1 FIX: Watch actual selected school IDs to detect school changes
    // Without this, clicking different map markers doesn't trigger recomputation
    // Phase 2.20 BUG FIX: Include map state in dependencies to preserve bbox when toggle OFF
    // Phase 2.28.7 FIX: Use serialized searchBoundsKey instead of searchBounds object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCatchmentRadius, dispatch, selectedSchoolIds, userDefinedMapArea, searchBoundsKey]);

  /**
   * Phase 2.20: Auto-search on school selection with 800ms debounce
   * Trigger property search when school selection changes (only if toggle is ON)
   */
  useEffect(() => {
    const handleSchoolSelectionAutoSearch = async () => {
      // Phase 2.28.7 FIX: Skip if search already in progress (prevent concurrent requests)
      if (searchPending) {
        console.log('[SchoolPanel] Auto-search skipped: Search already in progress');
        return;
      }

      // Only trigger if toggle is ON
      if (!showCatchmentRadius) {
        console.log('[SchoolPanel] Auto-search skipped: Toggle is OFF');
        return;
      }

      // Only trigger if schools are selected
      if (selectedSchools.length === 0) {
        console.log('[SchoolPanel] Auto-search skipped: No schools selected');
        return;
      }

      console.log('[SchoolPanel] Auto-search triggered after 800ms debounce:', {
        selectedSchoolCount: selectedSchools.length,
        schoolIds: selectedSchools.map(s => s.school_id),
        schoolNames: selectedSchools.map(s => s.school_name)
      });

      // Phase 2.28.7 FIX: Only update spatial filter if it actually changed
      // Prevents infinite loops from unnecessary state updates in auto-search
      const needsFilterUpdate = activeSpatialFilter !== 'schoolCatchment';

      if (needsFilterUpdate) {
        console.log('[SchoolPanel] Auto-search: Spatial filter changed to schoolCatchment');
        // Phase 2.24 FIX: Set activeSpatialFilter to schoolCatchment
        // This ensures performSearch() uses school-based filtering instead of bbox
        // Critical for non-catchment schools which can't use computeSchoolCatchmentUnion()
        dispatch(setActiveSpatialFilter('schoolCatchment'));
      } else {
        console.log('[SchoolPanel] Auto-search: Spatial filter already schoolCatchment, skipping update');
      }

      // Trigger property search
      try {
        const result = await dispatch(performSearch());

        // Check if the search was rejected
        if (performSearch.rejected.match(result)) {
          const errorPayload = result.payload as any;

          // Don't show toast for spatial conflicts (dialog will handle it)
          if (errorPayload?.type === 'SPATIAL_CONFLICT') {
            console.log('[SchoolPanel] Spatial conflict detected during auto-search');
            return;
          }

          // Show toast for other errors
          const errorMessage = typeof errorPayload === 'string'
            ? errorPayload
            : 'Failed to search properties. Please try again.';
          toast.error(errorMessage);
          console.error('[SchoolPanel] Auto-search failed:', errorMessage);
        } else {
          console.log('[SchoolPanel] Auto-search completed successfully');
        }
      } catch (error) {
        console.error('[SchoolPanel] Auto-search failed with exception:', error);
        toast.error('Failed to search properties. Please try again.');
      }
    };

    handleSchoolSelectionAutoSearch();
    // Phase 2.25 BUG FIX: Re-add showCatchmentRadius to dependencies
    // Previous Phase 2.22 fix removed it to prevent duplicate searches, but this caused STALE CLOSURE bug
    // When toggle changed but useEffect hadn't re-run, the guard check used OLD toggle value
    // This resulted in school marker clicks being rejected when toggle was already ON
    // Now includes showCatchmentRadius in dependency array so closure always has CURRENT value
    // Guard conditions (toggle OFF, no schools selected) prevent duplicate searches
  }, [debouncedSelectedSchoolIds, dispatch, showCatchmentRadius]);

  /**
   * Handle school selection
   * Phase 2.14 FIX: Auto-center map on selected school so catchment polygon is visible
   * Phase 2.23 FIX: Removed validation check to allow Redux auto-deselect to work
   *                 Redux will auto-clear previous school before adding new one
   */
  const handleSelectSchool = useCallback((school: School) => {
    // Phase 2.23: Remove validation - let Redux handle the single-selection constraint
    // Redux reducer automatically clears previous school when limit is reached
    dispatch(selectSchool(school));

    // Auto-center map on the selected school so user can see catchment polygon
    if (onCenterSchool && school.latitude && school.longitude) {
      // Small delay to ensure Redux state updates before map centering
      setTimeout(() => {
        onCenterSchool(school);
      }, 100);
    }
  }, [dispatch, onCenterSchool]);

  /**
   * Handle school deselection
   */
  const handleDeselectSchool = useCallback((schoolId: string) => {
    dispatch(deselectSchool(schoolId));
  }, [dispatch]);

  /**
   * Handle center school on map
   */
  const handleCenterSchool = useCallback((school: School) => {
    if (onCenterSchool) {
      onCenterSchool(school);
    }
  }, [onCenterSchool]);

  /**
   * Handle autocomplete selection
   */
  const handleAutocompleteSelect = useCallback((school: School) => {
    handleSelectSchool(school);
  }, [handleSelectSchool]);

  /**
   * Check if a school is selected
   */
  const isSchoolSelected = useCallback((schoolId: string) => {
    return selectedSchools.some(s => s.school_id === schoolId);
  }, [selectedSchools]);

  /**
   * Check if we can select more schools
   */
  const canSelectMore = useMemo(() => {
    return selectedSchools.length < MAX_SELECTED_SCHOOLS;
  }, [selectedSchools]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: themeColors.primaryLight, borderRight: `2px solid ${themeBorder}` }}>
      {/* Filters Section */}
      <SchoolFilters onAutocompleteSelect={handleAutocompleteSelect} />

      {/* Phase 2.12.1: Toggle Controls Section - Compact */}
      <Box sx={{ px: 1.5, py: 0.75, borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Toggle 1: Show Schools on Map */}
        {/* Phase 2.12.2: Updated label to clarify that it shows nearby schools in bounds */}
        <FormControlLabel
          control={
            <Switch
              checked={showSchoolsOnMap}
              onChange={(e) => dispatch(setShowSchoolsOnMap(e.target.checked))}
              size="small"
              title="Show all schools in current map view"
            />
          }
          label={
            <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
              Show nearby schools
            </Typography>
          }
          sx={{ margin: 0 }}
        />

        {/* Toggle 2: Filter by School Areas */}
        <FormControlLabel
          control={
            <Switch
              checked={showCatchmentRadius}
              onChange={(e) => dispatch(setShowCatchmentRadius(e.target.checked))}
              disabled={selectedSchools.length === 0 || searchPending}
              size="small"
            />
          }
          label={
            <Box>
              <Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                Filter by school areas
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  color: '#999',
                  display: 'block',
                  mt: 0.25
                }}
              >
                Shows properties within catchment boundaries
              </Typography>
            </Box>
          }
          sx={{ margin: 0 }}
        />
      </Box>

      {/* Results Section */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert
            severity="error"
            onClose={() => dispatch(clearError())}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#999' }}>
              {filters.schoolName || Object.values(filters).some(v => v)
                ? 'No schools found. Try adjusting your filters.'
                : 'Enter a school name to start searching.'}
            </Typography>
          </Box>
        )}

        {/* School Results List */}
        {!loading && searchResults.length > 0 && (
          <Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                {searchResults.length} School{searchResults.length !== 1 ? 's' : ''} Found
                {selectedSchools.length > 0 && ` • ${selectedSchools.length} Selected`}
              </Typography>
            </Box>

            {searchResults.map((school) => (
              <SchoolListItem
                key={school.school_id}
                school={school}
                isSelected={isSchoolSelected(school.school_id)}
                canSelect={canSelectMore || isSchoolSelected(school.school_id)}
                onSelect={handleSelectSchool}
                onDeselect={handleDeselectSchool}
                onCenter={handleCenterSchool}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Selected Schools Summary Footer */}
      {selectedSchools.length > 0 && (
        <Box sx={{
          px: 1.5,
          py: 0.75,
          bgcolor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '70%',
            }}
          >
            Selected: {selectedSchools[0].school_name}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // Phase 2.16: Clear single selection
              dispatch(deselectSchool(selectedSchools[0].school_id));
            }}
            sx={{
              borderColor: '#999',
              color: '#666',
              fontSize: '0.7rem',
              padding: '2px 6px',
              minWidth: 'auto',
              '&:hover': {
                borderColor: '#0b2d2c',
                color: '#0b2d2c',
              },
            }}
          >
            Clear
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SchoolPanel;
