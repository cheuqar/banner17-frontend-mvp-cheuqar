import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Switch,
  Alert,
  FormControlLabel
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchSchools,
  toggleSchoolSelection,
  clearSchoolSelection,
  setSchoolSearchQuery,
  setSchoolTypeFilter,
  computeSchoolCatchmentUnion,
  setCatchmentFilterEnabled,
  setActiveSpatialFilter,
  performSearch,
  clearMappedArea  // Sprint 2: Auto-clear bbox when catchment enabled
} from '../../../store/slices/smartSearchSlice';
import type { RootState, AppDispatch } from '../../../store';
import type { School } from '../../../store/slices/smartSearchSlice';
import { SelectedSchoolsSection } from './SelectedSchoolsSection';
import { SchoolSearchSection } from './SchoolSearchSection';
// NEW: Phase 2.10.7.4 - School marker toggle
import { toggleShowMarkersOnMap } from '../../../store/slices/smartSearch/schoolPanelSlice';
import { selectShowMarkersOnMap, selectVisibleMarkerCount } from '../../../store/slices/smartSearch/schoolPanelSelectors';

interface SchoolPanelProps {
  /** Optional callback to center map on a school */
  onCenterSchool?: (school: School) => void;
}

const SchoolPanel: React.FC<SchoolPanelProps> = ({ onCenterSchool }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { schools, mapControls, userDefinedMapArea, mapAreaType } = useSelector(
    (state: RootState) => state.smartSearch
  );

  // NEW: Phase 2.10.7.4 - School marker visibility state
  const showMarkersOnMap = useSelector(selectShowMarkersOnMap);
  const visibleMarkerCount = useSelector(selectVisibleMarkerCount);

  // BUG-04 FIX: Calculate schools with catchment data from cache instead of schools.data
  // This ensures selected schools persist even when schools.data changes due to searches
  // Safety check: handle undefined/null cache (Redux Persist loading or state migration)
  const selectedWithCatchments = (schools.selectedSchoolsCache || [])
    .filter(s => s.has_catchment_boundary);
  const selectedWithCatchmentsCount = selectedWithCatchments.length;

  // Initial load: fetch schools when panel opens
  useEffect(() => {
    // Only fetch when schools panel is actually open
    if (mapControls.activePanel !== 'schools') return;

    // Fetch schools on mount and when school type filter changes
    dispatch(fetchSchools(schools.searchQuery));
  }, [mapControls.activePanel, schools.schoolTypeFilter, dispatch]);

  const handleToggleSchool = async (school: School) => {
    dispatch(toggleSchoolSelection(school.id));
    // REMOVED: Auto-refresh on selection (Phase 2.5.11 Sprint 1)
    // School selection now requires explicit "Apply" button click
  };

  const handleRemoveSchool = (school: School) => {
    dispatch(toggleSchoolSelection(school.id));
  };

  const handleSearchChange = (query: string) => {
    // Update Redux state and trigger search
    dispatch(setSchoolSearchQuery(query));
    dispatch(fetchSchools(query));
  };

  const handleSchoolTypeChange = (type: 'all' | 'primary' | 'secondary' | 'infants') => {
    dispatch(setSchoolTypeFilter(type));
  };

  const handleToggleCatchmentFilter = async (enabled: boolean) => {
    // FIX Issue 3: Toggle now only enables/disables spatial filter
    // ON = Apply filter with current selections
    // OFF = Disable spatial filter but PRESERVE selections

    if (enabled) {
      // Apply filter: Compute catchment union and trigger search
      if (schools.selectedSchoolIds.length === 0) {
        toast.error('Please select at least one school');
        return;
      }

      // Compute catchment union first
      const result = await dispatch(computeSchoolCatchmentUnion());

      if (computeSchoolCatchmentUnion.fulfilled.match(result)) {
        // Enable catchment filter
        dispatch(setCatchmentFilterEnabled(true));
        dispatch(setActiveSpatialFilter('schoolCatchment'));

        // Clear bbox if present (spatial filter priority)
        if (userDefinedMapArea && mapAreaType === 'mapped') {
          dispatch(clearMappedArea());
        }

        // Trigger property search
        await dispatch(performSearch());

        // Show success feedback
        toast.success(
          `Filtering by ${selectedWithCatchmentsCount} school catchment${selectedWithCatchmentsCount > 1 ? 's' : ''}`
        );
      } else {
        toast.error('Failed to compute catchment union');
      }
    } else {
      // Disable filter: Keep selections, just disable spatial filter
      // DO NOT call clearSchoolSelection() - preserve user selections
      dispatch(setCatchmentFilterEnabled(false));
      dispatch(setActiveSpatialFilter('none'));

      // Re-trigger search without catchment
      await dispatch(performSearch());

      toast.info('School catchment filter disabled (selections preserved)');
    }
  };

  // NEW: Phase 2.10.7.4 - Handle school marker visibility toggle
  // NEW: Phase 2.10.7.5 - Handle school center on map
  const handleCenterSchool = useCallback((school: School) => {
    if (onCenterSchool) {
      onCenterSchool(school);
    }
  }, [onCenterSchool]);

  // NEW: Phase 2.10.7.4 - Handle school marker visibility toggle
  const handleToggleMarkers = (enabled: boolean) => {
    dispatch(toggleShowMarkersOnMap(enabled));
  };

  // BUG-04 FIX: Get selected schools objects from cache instead of filtering schools.data
  // This ensures selected schools persist even when schools.data changes due to searches
  // Safety check: handle undefined/null cache (Redux Persist loading or state migration)
  const selectedSchools = schools.selectedSchoolsCache || [];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* FIX Issue 2: Removed duplicate "Schools" header - PanelContainer already shows "School Catchments" title */}

      {/* Compact Toggle Button - Handles both Apply and Clear */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.300' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={schools.catchmentFilterEnabled}
            onChange={(e) => handleToggleCatchmentFilter(e.target.checked)}
            disabled={
              schools.isLoading ||
              selectedWithCatchmentsCount === 0 ||
              schools.catchmentComputeStatus === 'computing'
            }
            size="small"
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {schools.catchmentComputeStatus === 'computing' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CircularProgress size={14} />
                  <span>Computing catchment...</span>
                </Box>
              ) : (
                'School Catchment Filter'
              )}
            </Typography>
            {selectedWithCatchmentsCount > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {selectedWithCatchmentsCount} school{selectedWithCatchmentsCount > 1 ? 's' : ''} selected
              </Typography>
            )}
          </Box>
        </Box>

        {/* NEW: Phase 2.10.7.4 - School Marker Visibility Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <Switch
            checked={showMarkersOnMap}
            onChange={(e) => handleToggleMarkers(e.target.checked)}
            size="small"
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Show Schools on Map
            </Typography>
            {showMarkersOnMap && visibleMarkerCount > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {visibleMarkerCount} school{visibleMarkerCount > 1 ? 's' : ''} visible
              </Typography>
            )}
          </Box>
        </Box>

        {/* NEW: Enhanced error handling UI (Sprint 3) */}
        {schools.catchmentComputeError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Failed to compute catchment union
            </Typography>
            <Typography variant="caption">
              {schools.catchmentComputeError}. Try selecting fewer schools or contact support if the problem persists.
            </Typography>
          </Alert>
        )}

        {/* NEW: Info state when no catchment data available (Sprint 3) */}
        {schools.selectedSchoolIds.length > 0 && selectedWithCatchmentsCount === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              No Catchment Data
            </Typography>
            <Typography variant="caption">
              The selected schools don't have catchment boundary information. Try selecting different schools.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Section 1: Selected Schools (only shows if schools selected) */}
      <SelectedSchoolsSection
        schools={selectedSchools}
        onRemove={handleRemoveSchool}
      />

      {/* Section 2: School Search (scrollable) */}
      <SchoolSearchSection
        schools={schools.data}
        selectedSchoolIds={schools.selectedSchoolIds}
        searchQuery={schools.searchQuery}
        schoolTypeFilter={schools.schoolTypeFilter}
        isLoading={schools.isLoading}
        error={schools.error}
        onSearchChange={handleSearchChange}
        onSchoolTypeChange={handleSchoolTypeChange}
        onSelect={handleToggleSchool}
        onCenter={handleCenterSchool}
      />
    </Box>
  );
};

export default SchoolPanel;
