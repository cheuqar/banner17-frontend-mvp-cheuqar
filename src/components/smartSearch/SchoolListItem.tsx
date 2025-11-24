/**
 * School List Item Component
 * Phase 2.10.7.3 - School Panel UI - Filters & Autocomplete
 * =====================================================
 *
 * Displays individual school in 4-row layout:
 * Row 1: School Name + Action Buttons
 * Row 2: Attributes (selective, type, level, gender)
 * Row 3: Location (address, suburb, postcode)
 * Row 4: Academic Performance (state rank, HSC ATAR)
 *
 * Features:
 * - Compact 4-row design with proper visual hierarchy
 * - Graceful handling of missing data (no placeholders)
 * - Hover and selected states
 * - Style4-V2 theming (black/white/gray palette)
 * - Responsive design
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
} from '@mui/material';
import MapIcon from '@mui/icons-material/LocationOnOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { School } from '../../types/smartSearch';

interface SchoolListItemProps {
  /** School data object */
  school: School;

  /** Whether school is currently selected */
  isSelected: boolean;

  /** Whether school can be selected (false if 3/3 already selected) */
  canSelect: boolean;

  /** Callback when school is selected */
  onSelect: (school: School) => void;

  /** Callback when school is deselected */
  onDeselect: (schoolId: string) => void;

  /** Callback to center map on school */
  onCenter: (school: School) => void;
}

/**
 * Helper function to get school type color
 */
function getSchoolTypeColor(type?: string): string {
  if (!type) return '#999';
  const normalized = type.toLowerCase();
  if (normalized.includes('government') || normalized.includes('public')) return '#1976d2';
  if (normalized.includes('catholic')) return '#7b1fa2';
  if (normalized.includes('independent')) return '#388e3c';
  return '#666';
}

/**
 * Helper function to get school type display name
 */
function getSchoolTypeDisplay(type?: string): string {
  if (!type) return '';
  const normalized = type.toLowerCase();
  if (normalized.includes('government') || normalized.includes('public')) return 'Government';
  if (normalized.includes('catholic')) return 'Catholic';
  if (normalized.includes('independent')) return 'Independent';
  if (normalized.includes('private')) return 'Private';
  return type;
}

/**
 * Helper function to get education level abbreviation
 */
function getEducationLevelAbbr(level?: string): string {
  if (!level) return '';
  const normalized = level.toLowerCase();
  if (normalized.includes('infants')) return 'I';
  if (normalized.includes('primary')) return 'P';
  if (normalized.includes('secondary')) return 'S';
  if (normalized.includes('combined') || normalized.includes('k-12')) return 'K-12';
  return level.charAt(0).toUpperCase();
}

/**
 * SchoolListItem Component
 */
export const SchoolListItem: React.FC<SchoolListItemProps> = ({
  school,
  isSelected,
  canSelect,
  onSelect,
  onDeselect,
  onCenter,
}) => {
  // Phase 2.23: Removed isDisabled derived state - allow all schools to remain clickable
  // Redux auto-deselect logic (Phase 2.16) handles the single-selection constraint

  /**
   * Memoize attribute chips to avoid unnecessary re-renders
   */
  const attributeChips = useMemo(() => {
    const chips: React.ReactNode[] = [];

    // Selective school badge (red/pink)
    if (school.selective_school === 'Yes') {
      chips.push(
        <Chip
          key="selective"
          label="SELECTIVE"
          size="small"
          sx={{
            backgroundColor: '#ef5350',
            color: '#fff',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        />
      );
    }

    // School type badge
    if (school.school_type) {
      chips.push(
        <Chip
          key="type"
          label={getSchoolTypeDisplay(school.school_type)}
          size="small"
          sx={{
            backgroundColor: getSchoolTypeColor(school.school_type),
            color: '#fff',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        />
      );
    }

    // Education level badge
    if (school.education_level) {
      const abbr = getEducationLevelAbbr(school.education_level);
      if (abbr) {
        chips.push(
          <Chip
            key="level"
            label={abbr}
            size="small"
            sx={{
              backgroundColor: '#9c27b0',
              color: '#fff',
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
            }}
          />
        );
      }
    }

    // Gender badge
    if (school.gender) {
      chips.push(
        <Chip
          key="gender"
          label={school.gender}
          size="small"
          sx={{
            backgroundColor: '#2196f3',
            color: '#fff',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        />
      );
    }

    return chips;
  }, [school]);

  /**
   * Memoize performance metrics to avoid unnecessary re-renders
   */
  const performanceMetrics = useMemo(() => {
    const metrics: React.ReactNode[] = [];

    // State rank
    if (school.state_rank) {
      metrics.push(
        <Chip
          key="state_rank"
          label={`#${school.state_rank}`}
          size="small"
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        />
      );
    }

    // HSC ATAR average
    if (school.hsc_avg_atar_nsw) {
      metrics.push(
        <Chip
          key="hsc_atar"
          label={`HSC ${school.hsc_avg_atar_nsw}`}
          size="small"
          sx={{
            backgroundColor: '#388e3c',
            color: '#fff',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        />
      );
    }

    return metrics;
  }, [school]);

  /**
   * Handle selection toggle
   * Phase 2.23: Simplified to always allow selection - Redux auto-deselect handles single-selection constraint
   */
  const handleToggleSelect = () => {
    console.log('[SchoolListItem] Click detected on school:', school.school_name, {
      isSelected,
      schoolId: school.school_id,
    });
    if (isSelected) {
      console.log('[SchoolListItem] Deselecting school...');
      onDeselect(school.school_id);
    } else {
      console.log('[SchoolListItem] Selecting school...');
      console.log('[SchoolListItem] School object being selected:', {
        school_name: school.school_name,
        school_id: school.school_id,
        catchment_area: school.catchment_area,
        has_catchment_boundary: school.catchment_boundary != null,
        catchment_boundary_type: school.catchment_boundary ? typeof school.catchment_boundary : 'null/undefined',
        catchment_boundary_length: Array.isArray(school.catchment_boundary) ? school.catchment_boundary.length : 'N/A',
      });
      onSelect(school);
    }
  };

  return (
    <Card
      onClick={handleToggleSelect}
      sx={{
        p: 1.5,
        mb: 1,
        backgroundColor: isSelected ? '#f5f5f5' : '#fff',
        border: isSelected ? '2px solid #000' : '1px solid #e0e0e0',
        borderRadius: 1,
        transition: 'all 0.2s ease',
        opacity: 1, // Phase 2.23: Always visible, allow all schools to remain clickable
        cursor: 'pointer', // Phase 2.23: Always clickable
        '&:hover': {
          // Phase 2.23: Always apply hover state
          backgroundColor: '#f9f9f9',
          borderColor: '#000',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        position: 'relative',
      }}
    >
      {/* Row 1: School Name + Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 0.75,
          gap: 1,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            lineHeight: 1.3,
            color: '#000',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            maxWidth: 'calc(100% - 100px)',
          }}
        >
          {school.school_name}
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, alignItems: 'center' }}>
          {/* Selection indicator - only show when selected */}
          {isSelected && (
            <CheckCircleIcon
              sx={{
                fontSize: '1.25rem',
                color: '#000',
                flexShrink: 0,
              }}
            />
          )}

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onCenter(school);
            }}
            title="Center map on school"
            sx={{
              p: 0.5,
              backgroundColor: '#f0f0f0',
              '&:hover': { backgroundColor: '#e0e0e0' },
              flexShrink: 0,
            }}
          >
            <MapIcon sx={{ fontSize: '1rem' }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (isSelected) {
                onDeselect(school.school_id);
              }
            }}
            disabled={!isSelected}
            title={isSelected ? 'Deselect school' : 'School not selected'}
            sx={{
              p: 0.5,
              backgroundColor: isSelected ? '#ffebee' : '#f0f0f0',
              '&:hover': { backgroundColor: isSelected ? '#ffcccc' : '#e0e0e0' },
              flexShrink: 0,
            }}
          >
            <CloseIcon sx={{ fontSize: '1rem', color: isSelected ? '#c00' : '#999' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Row 2: Key Attributes (selective, type, level, gender) */}
      {attributeChips.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            mb: 0.75,
          }}
        >
          {attributeChips}
        </Box>
      )}

      {/* Row 3: Location */}
      {(school.address || school.suburb || school.postcode) && (
        <Box sx={{ mb: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.8rem',
              color: '#666',
              lineHeight: 1.4,
            }}
          >
            {school.address ? (
              <>
                {school.address}
                {school.suburb && ` – ${school.suburb}`}
                {school.postcode && ` ${school.postcode}`}
              </>
            ) : school.suburb ? (
              <>
                {school.suburb}
                {school.postcode && ` ${school.postcode}`}
              </>
            ) : (
              school.postcode
            )}
          </Typography>
        </Box>
      )}

      {/* Row 4: Academic Performance */}
      {performanceMetrics.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {performanceMetrics}
        </Box>
      )}
    </Card>
  );
};

export default SchoolListItem;
