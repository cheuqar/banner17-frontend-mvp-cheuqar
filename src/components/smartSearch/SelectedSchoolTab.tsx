/**
 * Selected School Tab Component
 * Phase 2.47: Displays selected school details and property statistics
 *
 * Features:
 * - School info header (name, type, address, catchment indicator)
 * - Property statistics box
 * - Action buttons (View on MySchool, Clear Selection)
 * - Style4-V2 design (black/white/gray palette)
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Link,
} from '@mui/material';
import {
  School as SchoolIcon,
  LocationOn as LocationIcon,
  OpenInNew as OpenInNewIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectThemeColors } from '../../store/slices/themeSlice';
import {
  deselectSchool,
  setSchoolPanelTab,
} from '../../store/slices/smartSearch/schoolPanelSlice';
import {
  selectShowCatchmentRadius,
} from '../../store/slices/smartSearchSlice';
import SchoolPropertyStatsBox from './SchoolPropertyStatsBox';
import type { School } from '../../types/smartSearch';

interface SelectedSchoolTabProps {
  /** The selected school to display */
  school: School;
  /** Search radius in km when not using catchment */
  radiusKm?: number;
}

/**
 * SelectedSchoolTab Component
 */
export const SelectedSchoolTab: React.FC<SelectedSchoolTabProps> = ({
  school,
  radiusKm = 3.0,
}) => {
  const dispatch = useAppDispatch();
  const themeColors = useAppSelector(selectThemeColors);
  const showCatchmentRadius = useAppSelector(selectShowCatchmentRadius);

  // Determine if this school uses catchment or radius
  const useCatchment = school.has_catchment_boundary && showCatchmentRadius;

  // Handle clear selection
  const handleClearSelection = () => {
    dispatch(deselectSchool(school.school_id));
    dispatch(setSchoolPanelTab('search'));
  };

  // Build MySchool URL
  const mySchoolUrl = `https://www.myschool.edu.au/school/search?q=${encodeURIComponent(school.school_name)}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
      }}
    >
      {/* School Info Header */}
      <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
        {/* School Name */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <SchoolIcon
            sx={{
              fontSize: 24,
              color: themeColors.linkButtonActive,
              mr: 1,
              mt: 0.25,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#000',
                lineHeight: 1.3,
                fontSize: '1rem',
              }}
            >
              {school.school_name}
            </Typography>

            {/* School Type Chips */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.75 }}>
              {school.education_level && (
                <Chip
                  label={school.education_level}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: '#e3f2fd',
                    color: '#1565c0',
                  }}
                />
              )}
              {school.school_type && (
                <Chip
                  label={school.school_type}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: '#f3e5f5',
                    color: '#7b1fa2',
                  }}
                />
              )}
              {school.gender && school.gender !== 'coed' && (
                <Chip
                  label={school.gender === 'boys' ? 'Boys' : 'Girls'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: school.gender === 'boys' ? '#e8f5e9' : '#fce4ec',
                    color: school.gender === 'boys' ? '#2e7d32' : '#c2185b',
                  }}
                />
              )}
              {school.selective_school === 'Yes' && (
                <Chip
                  label="Selective"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: '#fff3e0',
                    color: '#ef6c00',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Address */}
        {(school.address || school.suburb) && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <LocationIcon sx={{ fontSize: 16, color: '#666', mr: 0.5, mt: 0.25 }} />
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
              {school.address || school.suburb}
              {school.postcode && ` ${school.postcode}`}
            </Typography>
          </Box>
        )}

        {/* Catchment Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={
              useCatchment
                ? 'Has Official Catchment'
                : `Using ${radiusKm}km Radius`
            }
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              bgcolor: useCatchment ? '#e8f5e9' : '#fff3e0',
              color: useCatchment ? '#2e7d32' : '#ef6c00',
              fontWeight: 500,
            }}
          />
          {school.state_rank && (
            <Typography variant="caption" sx={{ color: '#666' }}>
              State Rank: {school.state_rank}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Property Statistics Box */}
      {showCatchmentRadius && (
        <Box sx={{ p: 2 }}>
          <SchoolPropertyStatsBox
            schoolId={school.school_id}
            schoolName={school.school_name}
            useCatchment={useCatchment}
            radiusKm={radiusKm}
          />
        </Box>
      )}

      {/* Academic Performance Placeholder */}
      {!showCatchmentRadius && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            Enable "Filter by school areas" to see property statistics for this school's catchment area.
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box
        sx={{
          mt: 'auto',
          p: 2,
          bgcolor: '#fafafa',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<OpenInNewIcon />}
          component={Link}
          href={mySchoolUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            flex: 1,
            borderColor: '#ccc',
            color: '#666',
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': {
              borderColor: themeColors.linkButtonActive,
              color: themeColors.linkButtonActive,
            },
          }}
        >
          View on MySchool
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleClearSelection}
          sx={{
            flex: 1,
            borderColor: '#f44336',
            color: '#f44336',
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#d32f2f',
              bgcolor: '#ffebee',
            },
          }}
        >
          Clear Selection
        </Button>
      </Box>
    </Box>
  );
};

export default SelectedSchoolTab;
