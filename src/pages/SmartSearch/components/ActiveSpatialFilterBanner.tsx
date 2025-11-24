import React from 'react';
import { Box, Typography, IconButton, Fade } from '@mui/material';
import { School as SchoolIcon, Close as CloseIcon, Edit as DrawIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  setCatchmentFilterEnabled,
  setActiveSpatialFilter,
  performSearch,
  clearDrawnPolygons
} from '../../../store/slices/smartSearchSlice';
import type { RootState } from '../../../store';
import { useAppDispatch } from '../../../store';

/**
 * Banner component that appears at top of map when spatial filter is active
 * Supports: School Catchment (Phase 2.5.9) and Drawn Polygon (Phase 2.7)
 */
const ActiveSpatialFilterBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeSpatialFilter = useSelector((state: RootState) =>
    state.smartSearch.activeSpatialFilter
  );
  const selectedSchoolIds = useSelector((state: RootState) =>
    state.smartSearch.schools.selectedSchoolIds
  );
  const schools = useSelector((state: RootState) =>
    state.smartSearch.schools.data
  );
  const drawnPolygons = useSelector((state: RootState) =>
    state.smartSearch.drawnPolygons
  ) || []; // Safety: default to empty array if undefined

  // Calculate schools with catchment data
  const selectedWithCatchments = schools
    .filter(s => selectedSchoolIds.includes(s.id))
    .filter(s => s.has_catchment_boundary);
  const schoolCount = selectedWithCatchments.length;

  // Determine visibility and banner content based on active spatial filter
  const isCatchmentVisible = activeSpatialFilter === 'schoolCatchment' && schoolCount > 0;
  const isDrawnVisible = activeSpatialFilter === 'drawnPolygon' && drawnPolygons.length > 0;
  const isVisible = isCatchmentVisible || isDrawnVisible;

  const handleClear = async () => {
    if (activeSpatialFilter === 'schoolCatchment') {
      // Clear catchment filter
      dispatch(setCatchmentFilterEnabled(false));
      dispatch(setActiveSpatialFilter('none'));

      // Re-trigger search without catchment filter
      dispatch(performSearch());

      // Show toast notification
      toast.info('School catchment filter cleared');
    } else if (activeSpatialFilter === 'drawnPolygon') {
      // Clear drawn polygon filter
      dispatch(clearDrawnPolygons());

      // Re-trigger search without drawn polygon filter
      dispatch(performSearch());

      // Show toast notification
      toast.info('Drawn area filter cleared');
    }
  };

  // Determine banner icon and text
  const bannerIcon = isCatchmentVisible ? <SchoolIcon fontSize="small" sx={{ color: 'white' }} /> : <DrawIcon fontSize="small" sx={{ color: 'white' }} />;
  const bannerText = isCatchmentVisible
    ? `Filtering by ${schoolCount} school catchment${schoolCount > 1 ? 's' : ''}`
    : `Filtering by drawn area (${drawnPolygons.length} polygon${drawnPolygons.length > 1 ? 's' : ''})`;
  const ariaLabel = isCatchmentVisible ? 'Clear school catchment filter' : 'Clear drawn area filter';

  return (
    <Fade in={isVisible} timeout={300}>
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          bgcolor: 'primary.main',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 1,
          display: isVisible ? 'flex' : 'none', // Hide when not visible to prevent layout issues
          alignItems: 'center',
          gap: 1,
          boxShadow: 3,
          minWidth: 250,
          maxWidth: 400,
        }}
      >
        {bannerIcon}
        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
          {bannerText}
        </Typography>
        <IconButton
          size="small"
          onClick={handleClear}
          sx={{
            color: 'white',
            ml: 1,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
          aria-label={ariaLabel}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Fade>
  );
};

export default ActiveSpatialFilterBanner;
