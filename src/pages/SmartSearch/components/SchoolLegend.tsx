/**
 * School Legend Component
 * Phase 2.10.7.7 - Map Legend & Polish for Smart Search
 * =====================================================
 *
 * Displays a visual legend of school markers and catchment areas.
 * Legend only appears when schools are selected.
 *
 * Features:
 * - Shows selected school colors and marker styles
 * - Explains catchment area visualization (solid green)
 * - Explains nearby area visualization (dashed blue)
 * - Collapsible interface with smooth animation
 * - Style4-V2 design system compliance
 * - Responsive positioning (bottom-left of map)
 */

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import type { RootState } from '../../../store';
import {
  Card,
  Typography,
  Box,
  IconButton,
  Divider,
  Collapse,
  Chip
} from '@mui/material';
import ChevronDownIcon from '@mui/icons-material/ExpandMore';
import ChevronUpIcon from '@mui/icons-material/ExpandLess';
import {
  selectShowSchoolsOnMap,
  selectShowCatchmentRadius,
  toggleSchoolSelection
} from '../../../store/slices/smartSearchSlice';


const SchoolLegend: React.FC = () => {
  // Phase 2.12.4: Use Redux selectors for legend state tracking
  // selectedSchools must be a selector dependency to trigger re-renders when schools change
  const selectedSchools = useAppSelector((state: RootState) =>
    state.smartSearch.schools.selectedSchoolsCache || []
  );
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Phase 2.12.1: Check toggles for legend visibility
  const showSchoolsOnMap = useAppSelector(selectShowSchoolsOnMap);
  const showCatchmentRadius = useAppSelector(selectShowCatchmentRadius);

  // Only show legend when schools are selected AND either toggle is ON
  if (!selectedSchools || selectedSchools.length === 0 || (!showSchoolsOnMap && !showCatchmentRadius)) {
    return null;
  }

  return (
    <Card
      sx={{
        position: 'absolute',
        bottom: 72, // Above the status bar
        left: 16,
        maxWidth: 320,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        transition: 'all 0.2s ease-in-out',
        overflow: 'hidden'
      }}
    >
      {/* Legend Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E5E5'
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: '14px',
            color: '#333333',
            letterSpacing: '0.3px'
          }}
        >
          School Legends
        </Typography>

        {/* Collapse Toggle Button */}
        <IconButton
          size="small"
          onClick={() => setIsCollapsed(!isCollapsed)}
          sx={{
            color: '#666666',
            padding: '4px',
            '&:hover': {
              backgroundColor: '#F5F5F5'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {isCollapsed ? <ChevronUpIcon sx={{ fontSize: 20 }} /> : <ChevronDownIcon sx={{ fontSize: 20 }} />}
        </IconButton>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={!isCollapsed} timeout={200}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 0.75,
          p: 1,
        }}>
          {selectedSchools.map((school) => (
            <Chip
              key={school.id}
              label={
                <Typography variant="caption" noWrap sx={{ maxWidth: '100px' }}>
                  {school.name}
                </Typography>
              }
              size="small"
              variant="outlined"
              onDelete={() => dispatch(toggleSchoolSelection(school.id))}
              sx={{
                maxWidth: '100%',
                height: '28px',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  px: 1
                }
              }}
            />
          ))}
        </Box>
      </Collapse>
    </Card>
  );
};

export default SchoolLegend;
