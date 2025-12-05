/**
 * School Marker Popup Component
 * Phase 2.23 - School Marker Popup Enhancements
 * Phase 2.46 - Adjustable radius slider for non-catchment schools
 * =====================================================
 *
 * Reusable popup component displayed when school marker is clicked.
 * Provides school information and action buttons:
 * - Filter by School Area: Syncs with catchment radius toggle
 * - Search on MySchool: Opens MySchool portal with school name
 * - Adjustable radius slider (1-8km) for schools without catchment boundaries
 *
 * Features:
 * - Style4-V2 design system (black/white/gray palette)
 * - Redux integration for state management
 * - Disabled state during search operations
 * - URL encoding for MySchool search
 * - Debounced radius slider updates (300ms)
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Box, Typography, Button, Chip, Switch, FormControlLabel, Slider } from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  setShowCatchmentRadius,
  setActiveSpatialFilter,
  performSearch,
  selectShowCatchmentRadius,
  selectSchoolSearchRadius,
  setSchoolSearchRadius,
} from '../../../store/slices/smartSearchSlice';
import { deselectSchool } from '../../../store/slices/smartSearch/schoolPanelSlice';
import type { School } from '../../../types/smartSearch';

// Radius slider constants
const DEFAULT_RADIUS_KM = 3;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 8;
const RADIUS_STEP_KM = 0.5;

// Theme-A accent color
const THEME_ACCENT = '#f0492e';

// Slider marks for visual guidance
const RADIUS_MARKS = [
  { value: 1, label: '1km' },
  { value: 3, label: '3km' },
  { value: 5, label: '5km' },
  { value: 8, label: '8km' },
];

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
  const reduxSearchRadius = useAppSelector(selectSchoolSearchRadius);

  // Local state for immediate slider feedback
  const [localRadius, setLocalRadius] = useState(reduxSearchRadius || DEFAULT_RADIUS_KM);

  // Sync local state with Redux when Redux changes externally
  useEffect(() => {
    setLocalRadius(reduxSearchRadius || DEFAULT_RADIUS_KM);
  }, [reduxSearchRadius]);

  // Debounced callback for Redux updates and search trigger (300ms delay)
  const debouncedRadiusUpdate = useMemo(
    () =>
      debounce((newRadiusKm: number) => {
        console.log(`[SchoolMarkerPopup] Debounced radius update: ${newRadiusKm}km`);
        dispatch(setSchoolSearchRadius(newRadiusKm));
        // Trigger search if catchment filter is active
        if (showCatchmentRadius) {
          dispatch(performSearch());
        }
      }, 300),
    [dispatch, showCatchmentRadius]
  );

  // Handle slider change - update local state immediately, debounce Redux/API
  const handleRadiusChange = useCallback((_event: Event, value: number | number[]) => {
    const newRadius = typeof value === 'number' ? value : value[0];
    setLocalRadius(newRadius);
    debouncedRadiusUpdate(newRadius);
  }, [debouncedRadiusUpdate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedRadiusUpdate.cancel();
    };
  }, [debouncedRadiusUpdate]);

  /**
   * Phase 2.25 FIX: Auto-trigger search when school marker is clicked
   * REMOVED in Phase 2.46: This was causing duplicate API calls.
   * SchoolPanel.tsx already handles school selection changes via its useEffect hooks:
   * - First useEffect: handles toggle changes and filter updates
   * - Second useEffect: handles school selection with 800ms debounce
   *
   * We only log for debugging purposes now.
   */
  useEffect(() => {
    if (isSelected && showCatchmentRadius) {
      console.log('[SchoolMarkerPopup] School selected with catchment filter ON:', {
        schoolName: school.school_name,
        schoolId: school.school_id,
        hasCatchmentBoundary: !!(school.catchment_area && school.catchment_area !== null),
        note: 'Search will be triggered by SchoolPanel.tsx useEffect'
      });
    }
  }, [isSelected, school.school_id, school.school_name, school.catchment_area, showCatchmentRadius]);

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

      {/* Radius Slider for non-catchment schools */}
      {!hasCatchment && (
        <Box sx={{ mt: 1.5, px: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              color: '#666666',
              display: 'block',
              mb: 0.5,
            }}
          >
            Search radius: <strong>{localRadius}km</strong>
          </Typography>
          <Slider
            value={localRadius}
            onChange={handleRadiusChange}
            min={MIN_RADIUS_KM}
            max={MAX_RADIUS_KM}
            step={RADIUS_STEP_KM}
            marks={RADIUS_MARKS}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}km`}
            disabled={searchPending}
            sx={{
              color: THEME_ACCENT,
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0 0 0 8px ${THEME_ACCENT}33`,
                },
              },
              '& .MuiSlider-markLabel': {
                fontSize: '9px',
                color: '#999999',
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: THEME_ACCENT,
                fontSize: '11px',
              },
              '& .MuiSlider-rail': {
                opacity: 0.3,
              },
            }}
          />
        </Box>
      )}

      {/* Selected Status - Clickable to deselect */}
      {isSelected && (
        <Chip
          label="Selected"
          size="small"
          deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
          onDelete={() => {
            console.log('[SchoolMarkerPopup] Deselecting school via chip click:', school.school_name);
            dispatch(deselectSchool(school.school_id));
            // Also turn off the filter if it was active
            if (showCatchmentRadius) {
              dispatch(setShowCatchmentRadius(false));
              dispatch(setActiveSpatialFilter('none'));
              dispatch(performSearch());
            }
          }}
          sx={{
            height: 24,
            fontSize: '11px',
            bgcolor: '#0b2d2c',
            color: '#FFFFFF',
            fontWeight: 600,
            mt: 1,
            '& .MuiChip-deleteIcon': {
              color: '#FFFFFF',
              '&:hover': {
                color: '#FF6B6B',
              },
            },
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
                // Phase 2.46 FIX: Only dispatch toggle state change
                // SchoolPanel.tsx useEffect handles all search triggering to avoid duplicate API calls
                // Previously this handler was duplicating performSearch() calls that SchoolPanel already handles
                dispatch(setShowCatchmentRadius(e.target.checked));

                if (e.target.checked) {
                  console.log('[SchoolMarkerPopup] Filter by School Area turned ON - SchoolPanel will trigger search');
                } else {
                  console.log('[SchoolMarkerPopup] Filter by School Area turned OFF - SchoolPanel will trigger search');
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
