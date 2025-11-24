/**
 * Amenity Marker Popup Component
 * Phase 2.32.5 - Amenity Marker Popup
 * ======================================
 *
 * Reusable popup component displayed when amenity marker is clicked.
 * Provides amenity information and action buttons:
 * - Select/Deselect amenity
 * - View location details
 *
 * Features:
 * - Style4-V2 design system (black/white/gray palette)
 * - Category-based color coding
 * - Distance display
 * - Responsive layout
 */

import React, { useCallback } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import {
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../../store';
import { toggleAmenitySelection } from '../../../store/slices/smartSearchSlice';
import type { Amenity } from '../../../store/slices/smartSearchSlice';

interface AmenityMarkerPopupProps {
  /** Amenity data to display */
  amenity: Amenity;
  /** Whether this amenity is currently selected */
  isSelected?: boolean;
}

/**
 * Get category color for badges
 */
const getCategoryColor = (category: string): string => {
  const normalized = category.toLowerCase();
  if (normalized.includes('hospital')) return '#d32f2f'; // Red
  if (normalized.includes('librar')) return '#7b1fa2'; // Purple
  if (normalized.includes('shopping')) return '#f57c00'; // Orange
  if (normalized.includes('universit') || normalized.includes('tafe')) return '#1976d2'; // Blue
  if (normalized.includes('tourist') || normalized.includes('attraction')) return '#388e3c'; // Green
  if (normalized.includes('beach')) return '#0288d1'; // Light Blue
  if (normalized.includes('sport')) return '#c2185b'; // Pink
  return '#666'; // Default gray
};

/**
 * Format category display name
 */
const formatCategoryName = (category: string): string => {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const AmenityMarkerPopup: React.FC<AmenityMarkerPopupProps> = ({
  amenity,
  isSelected = false,
}) => {
  const dispatch = useAppDispatch();

  /**
   * Handle select/deselect button click
   */
  const handleToggleSelection = useCallback(() => {
    console.log('[AmenityMarkerPopup] Toggle selection for:', amenity.name);
    dispatch(toggleAmenitySelection(amenity.id));
  }, [dispatch, amenity.id, amenity.name]);

  return (
    <Box
      sx={{
        minWidth: 280,
        maxWidth: 350,
        p: 1.5,
        fontFamily: '"Amplitude", "Segoe UI", Roboto, system-ui, sans-serif',
      }}
    >
      {/* Amenity Name - Style4-V2 heading */}
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
        {amenity.name}
      </Typography>

      {/* Category & Subtype */}
      {(amenity.category || amenity.subtype) && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          {amenity.category && (
            <Chip
              label={formatCategoryName(amenity.category)}
              size="small"
              sx={{
                height: 20,
                fontSize: '11px',
                bgcolor: getCategoryColor(amenity.category),
                color: '#FFFFFF',
                fontWeight: 600,
              }}
            />
          )}
          {amenity.subtype && (
            <Chip
              label={amenity.subtype}
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
      {(amenity.address || amenity.suburb || amenity.postcode) && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, alignItems: 'flex-start' }}>
          <LocationIcon sx={{ fontSize: '14px', color: '#999999', mt: 0.2 }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: '12px',
              lineHeight: 1.5,
              color: '#666666',
            }}
          >
            {[amenity.address, amenity.suburb, amenity.postcode]
              .filter(Boolean)
              .join(', ')}
          </Typography>
        </Box>
      )}

      {/* Distance */}
      {amenity.distance_km !== null && amenity.distance_km !== undefined && (
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              color: '#999999',
              fontWeight: 500,
            }}
          >
            {amenity.distance_km.toFixed(1)} km away
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      {!isSelected && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {/* Add to Selection Button - Only show when not selected */}
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<CheckCircleIcon />}
            onClick={handleToggleSelection}
            sx={{
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'none',
              bgcolor: '#0b2d2c',
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: '#333333',
              },
            }}
          >
            Add to Selection
          </Button>
        </Box>
      )}

      {/* Description (if available) */}
      {amenity.description && (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #E0E0E0' }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              lineHeight: 1.5,
              color: '#666666',
              display: 'block',
            }}
          >
            {amenity.description}
          </Typography>
        </Box>
      )}

      {/* Data Source (if available) */}
      {amenity.data_source && (
        <Box sx={{ mt: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '10px',
              color: '#999999',
              fontStyle: 'italic',
            }}
          >
            Source: {amenity.data_source}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AmenityMarkerPopup;
