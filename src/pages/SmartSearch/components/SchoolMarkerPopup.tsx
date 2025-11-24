/**
 * School Marker Popup Component
 * Phase 2.23 - School Marker Popup Enhancements
 * =====================================================
 *
 * Reusable popup component displayed when school marker is clicked.
 * Provides school information and action buttons:
 * - Filter by School Area: Syncs with catchment radius toggle
 * - Search on MySchool: Opens MySchool portal with school name
 *
 * Features:
 * - Style4-V2 design system (black/white/gray palette)
 * - Redux integration for state management
 * - Disabled state during search operations
 * - URL encoding for MySchool search
 */

import React, { useCallback, useEffect } from 'react';
import { Box, Typography, Button, Chip, Switch, FormControlLabel } from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  setShowCatchmentRadius,
  computeSchoolCatchmentUnion,
  setActiveSpatialFilter,
  performSearch,
  selectShowCatchmentRadius,
} from '../../../store/slices/smartSearchSlice';
import type { School } from '../../../types/smartSearch';

interface SchoolMarkerPopupProps {
  /** School data to display */
  school: School;
  /** Whether this school is currently selected */
  isSelected?: boolean;
}

export const SchoolMarkerPopup: React.FC<SchoolMarkerPopupProps> = ({
  school,
  isSelected = false,
}) => {
  const dispatch = useAppDispatch();

  // Get current state from Redux
  const showCatchmentRadius = useAppSelector(selectShowCatchmentRadius);
  const searchPending = useAppSelector((state) => state.smartSearch.searchPending);

  /**
   * Phase 2.25 FIX: Auto-trigger search when school marker is clicked
   * If "Filter by School Area" toggle is already ON, trigger search immediately
   * This handles the case where user clicks a different school marker while filter is active
   */
  useEffect(() => {
    if (isSelected && showCatchmentRadius) {
      console.log('[SchoolMarkerPopup] School selected with catchment filter ON, triggering auto-search:', {
        schoolName: school.school_name,
        schoolId: school.school_id,
        hasCatchmentBoundary: !!(school.catchment_area && school.catchment_area !== null)
      });

      // Check if school has catchment boundaries
      const hasCatchmentBoundary = school.catchment_area && school.catchment_area !== null;

      if (hasCatchmentBoundary) {
        // Polygon mode: School has official catchment boundaries
        dispatch(computeSchoolCatchmentUnion()).then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            console.log('[SchoolMarkerPopup] Catchment union computed, triggering search');
            dispatch(setActiveSpatialFilter('schoolCatchment'));
            dispatch(performSearch());
          }
        });
      } else {
        // Radius mode: School doesn't have boundaries, use 3km radius circle
        console.log('[SchoolMarkerPopup] No catchment boundary, using radius mode');
        dispatch(setActiveSpatialFilter('schoolCatchment'));
        dispatch(performSearch());
      }
    }
  }, [isSelected, school.school_id, school.school_name, school.catchment_area, showCatchmentRadius, dispatch]);

  /**
   * Handle "Search on MySchool" button click
   * Opens MySchool portal in new tab with school name pre-filled
   */
  const handleSearchOnMySchool = useCallback(() => {
    console.log('[SchoolMarkerPopup] Opening MySchool search for:', school.school_name);

    // Encode school name for URL (spaces, special chars)
    const encodedSchoolName = encodeURIComponent(school.school_name);

    // MySchool search URL pattern
    const myschoolUrl = `https://myschool.edu.au/school-search?FormPosted=True&SchoolSearchQuery=${encodedSchoolName}&SchoolSector=&SchoolType=&State=`;

    // Open in new tab without opener access
    window.open(myschoolUrl, '_blank', 'noopener,noreferrer');
  }, [school.school_name]);

  // Format catchment indicator text
  const hasCatchment = school.catchment_area && school.catchment_area !== null;

  return (
    <Box
      sx={{
        minWidth: 280,
        maxWidth: 350,
        p: 1.5,
        fontFamily: '"Amplitude", "Segoe UI", Roboto, system-ui, sans-serif',
      }}
    >
      {/* School Name - Style4-V2 heading */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: 1.4,
          color: '#0b2d2c',
          mb: 0.5,
        }}
      >
        {school.school_name}
      </Typography>

      {/* School Type & Education Level */}
      {(school.school_type || school.education_level) && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          {school.school_type && (
            <Chip
              label={school.school_type}
              size="small"
              sx={{
                height: 20,
                fontSize: '11px',
                bgcolor: '#F5F5F5',
                color: '#666666',
                fontWeight: 500,
              }}
            />
          )}
          {school.education_level && (
            <Chip
              label={school.education_level}
              size="small"
              sx={{
                height: 20,
                fontSize: '11px',
                bgcolor: '#F5F5F5',
                color: '#666666',
                fontWeight: 500,
              }}
            />
          )}
        </Box>
      )}

      {/* Address */}
      {school.address && (
        <Typography
          variant="body2"
          sx={{
            fontSize: '12px',
            color: '#666666',
            mb: 0.5,
          }}
        >
          {school.address}
          {school.suburb && `, ${school.suburb}`}
          {school.postcode && ` ${school.postcode}`}
        </Typography>
      )}

      {/* Selective School Badge */}
      {school.selective_school === 'Yes' && (
        <Chip
          label="Selective"
          size="small"
          sx={{
            height: 20,
            fontSize: '11px',
            bgcolor: '#0b2d2c',
            color: '#FFFFFF',
            fontWeight: 600,
            mb: 0.5,
          }}
        />
      )}

      {/* Rankings & Scores */}
      {(school.state_rank || school.hsc_avg_atar_nsw) && (
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #E5E5E5' }}>
          {school.state_rank && (
            <Typography variant="caption" sx={{ display: 'block', color: '#666666', fontSize: '11px' }}>
              State Rank: {school.state_rank}
            </Typography>
          )}
          {school.hsc_avg_atar_nsw && (
            <Typography variant="caption" sx={{ display: 'block', color: '#666666', fontSize: '11px' }}>
              HSC Avg ATAR: {school.hsc_avg_atar_nsw}
            </Typography>
          )}
        </Box>
      )}

      {/* Catchment Area Indicator */}
      {hasCatchment && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            color: '#2196F3',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          ✓ Catchment boundary available
        </Typography>
      )}

      {/* Selected Status */}
      {isSelected && (
        <Chip
          label="Selected"
          size="small"
          sx={{
            height: 20,
            fontSize: '11px',
            bgcolor: '#0b2d2c',
            color: '#FFFFFF',
            fontWeight: 600,
            mt: 1,
          }}
        />
      )}

      {/* Action Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          mt: 1.5,
        }}
      >
        {/* Filter by School Area Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={showCatchmentRadius}
              onChange={(e) => {
                dispatch(setShowCatchmentRadius(e.target.checked));

                // Phase 2.25.2 FIX: Handle both ON and OFF toggle cases
                if (e.target.checked) {
                  // TURN ON: Filter by School Area
                  console.log('[SchoolMarkerPopup] Filter by School Area turned ON');
                  const hasCatchmentBoundary = school.catchment_area && school.catchment_area !== null;

                  if (hasCatchmentBoundary) {
                    // Polygon mode: School has official catchment boundaries
                    // Compute the union and set spatial filter
                    dispatch(computeSchoolCatchmentUnion()).then((result) => {
                      if (result.meta.requestStatus === 'fulfilled') {
                        dispatch(setActiveSpatialFilter('schoolCatchment'));
                        dispatch(performSearch());
                      }
                    });
                  } else {
                    // Radius mode: School doesn't have boundaries, use 3km radius circle
                    // Directly set spatial filter (no union computation needed)
                    dispatch(setActiveSpatialFilter('schoolCatchment'));
                    dispatch(performSearch());
                  }
                } else {
                  // TURN OFF: Reset to bbox filtering (map-oriented search)
                  console.log('[SchoolMarkerPopup] Filter by School Area turned OFF - switching back to bbox filtering');
                  dispatch(setActiveSpatialFilter('none'));
                  dispatch(performSearch());
                }
              }}
              disabled={searchPending}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: '#999999',
                  '&.Mui-checked': {
                    color: '#0b2d2c',
                  },
                  '&.Mui-checked + .MuiSwitch-track': {
                    bgcolor: '#CCCCCC',
                  },
                },
                '& .MuiSwitch-track': {
                  bgcolor: '#E5E5E5',
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                color: searchPending ? '#999999' : '#0b2d2c',
                transition: 'color 0.3s ease',
              }}
            >
              Filter by School Area
            </Typography>
          }
          sx={{
            m: 0,
            justifyContent: 'space-between',
            width: '100%',
          }}
        />

        {/* Show in MySchool Button */}
        <Button
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon sx={{ fontSize: '16px' }} />}
          onClick={handleSearchOnMySchool}
          disabled={searchPending}
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '13px',
            borderColor: '#666666',
            color: '#666666',
            py: 0.75,
            borderRadius: '8px',
            '&:hover': {
              borderColor: '#333333',
              bgcolor: '#F5F5F5',
            },
            '&:disabled': {
              borderColor: '#CCCCCC',
              color: '#999999',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Show in MySchool
        </Button>
      </Box>
    </Box>
  );
};

export default SchoolMarkerPopup;
