import React from 'react';
import { Box, Chip, Button, Stack } from '@mui/material';
import { Close as CloseIcon, Map as MapIcon, School as SchoolIcon, Edit as DrawIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { clearAllFilters, clearMappedArea, performSearch, setCatchmentFilterEnabled, setActiveSpatialFilter, setLocationFilter, clearDrawnPolygons } from '../../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../../store';
import { useAppDispatch } from '../../../../store';
import { toast } from 'react-toastify';

const FilterPills: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeFilters = useSelector((state: RootState) => state.smartSearch.activeFilters);
  const mapAreaType = useSelector((state: RootState) => state.smartSearch.mapAreaType);
  const userDefinedMapArea = useSelector((state: RootState) => state.smartSearch.userDefinedMapArea);
  // NEW: School catchment selectors (Sprint 3)
  const activeSpatialFilter = useSelector((state: RootState) => state.smartSearch.activeSpatialFilter);
  const selectedSchoolIds = useSelector((state: RootState) => state.smartSearch.schools.selectedSchoolIds);
  const schools = useSelector((state: RootState) => state.smartSearch.schools.data);
  // NEW: Drawn polygon selectors (Phase 2.7)
  // BUG-01 FIX: Ensure drawnPolygons is always an array, never undefined or null
  const drawnPolygons = useSelector((state: RootState) => {
    const polygons = state.smartSearch.drawnPolygons;
    if (!polygons || !Array.isArray(polygons)) {
      console.warn('[BUG-01 FIX] drawnPolygons selector returned non-array:', typeof polygons);
      return [];
    }
    return polygons;
  });

  // Calculate schools with catchment data
  const selectedWithCatchments = schools
    .filter(s => selectedSchoolIds.includes(s.id))
    .filter(s => s.has_catchment_boundary);
  const schoolCount = selectedWithCatchments.length;

  const handleClearAll = () => {
    dispatch(clearAllFilters());
  };

  const handleRemoveFilter = (filterKey: string) => {
    // NEW: Handle school catchment filter (Sprint 3)
    if (filterKey === 'school-catchment') {
      dispatch(setCatchmentFilterEnabled(false));
      dispatch(setActiveSpatialFilter('none'));
      dispatch(performSearch());
      toast.info('School catchment filter cleared');
      return;
    }

    // NEW: Handle drawn-area filter separately (Phase 2.7)
    if (filterKey === 'drawn-area') {
      dispatch(clearDrawnPolygons());
      dispatch(performSearch()); // Re-search without drawn polygon
      toast.info('Drawn area filter cleared');
      return;
    }

    // NEW: Handle mapped-area filter separately (Phase 2.5.7)
    if (filterKey === 'mapped-area') {
      dispatch(clearMappedArea());
      dispatch(performSearch()); // Re-search without bbox
      return;
    }

    // NEW: Handle postcode filter separately
    if (filterKey.startsWith('postcode:')) {
      dispatch(setLocationFilter({ postcode: null }));
      dispatch(performSearch());
      return;
    }

    // Extract filter type from key (e.g., "location:NSW" -> "location")
    // This is a simplified version - in a full implementation,
    // you'd need more sophisticated logic to clear specific filters
    console.log('Removing filter:', filterKey);
    // For now, just clear all filters when clicking a pill
    dispatch(clearAllFilters());
  };

  // Check if we have school catchment filter active OR drawn polygon filter OR regular activeFilters
  const hasActiveFilters = activeFilters.length > 0 ||
    (activeSpatialFilter === 'schoolCatchment' && schoolCount > 0) ||
    (activeSpatialFilter === 'drawnPolygon' && drawnPolygons.length > 0);

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
        <Box sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
          Active Filters:
        </Box>

        {/* NEW: Drawn polygon filter chip (Phase 2.7) - highest priority */}
        {activeSpatialFilter === 'drawnPolygon' && drawnPolygons.length > 0 && (
          <Chip
            icon={<DrawIcon sx={{ fontSize: '1rem' }} />}
            label={`Drawn Area (${drawnPolygons.length} polygon${drawnPolygons.length > 1 ? 's' : ''})`}
            onDelete={() => handleRemoveFilter('drawn-area')}
            deleteIcon={<CloseIcon />}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{
              fontWeight: 500,
            }}
          />
        )}

        {/* NEW: School catchment filter chip (Sprint 3) */}
        {activeSpatialFilter === 'schoolCatchment' && schoolCount > 0 && (
          <Chip
            icon={<SchoolIcon sx={{ fontSize: '1rem' }} />}
            label={`${schoolCount} School Catchment${schoolCount > 1 ? 's' : ''}`}
            onDelete={() => handleRemoveFilter('school-catchment')}
            deleteIcon={<CloseIcon />}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 500,
            }}
          />
        )}

        {activeFilters.map((filter, index) => {
          // NEW: Render mapped-area chip with icon (Phase 2.5.7)
          if (filter === 'mapped-area') {
            return (
              <Chip
                key={index}
                label="Mapped area"
                icon={<MapIcon sx={{ fontSize: '1rem' }} />}
                onDelete={() => handleRemoveFilter(filter)}
                deleteIcon={<CloseIcon />}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 500,
                }}
              />
            );
          }

          // Skip drawn-area since it's rendered separately above (Phase 2.7)
          if (filter === 'drawn-area') {
            return null;
          }

          // Regular filter chips
          return (
            <Chip
              key={index}
              label={filter}
              onDelete={() => handleRemoveFilter(filter)}
              deleteIcon={<CloseIcon />}
              size="small"
              sx={{
                bgcolor: 'grey.100',
                '&:hover': {
                  bgcolor: 'grey.200',
                },
              }}
            />
          );
        })}
        {activeFilters.length > 1 && (
          <Button
            size="small"
            onClick={handleClearAll}
            sx={{
              ml: 1,
              textTransform: 'none',
              fontSize: '0.875rem',
              color: 'text.secondary',
            }}
          >
            Clear All
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default FilterPills;
