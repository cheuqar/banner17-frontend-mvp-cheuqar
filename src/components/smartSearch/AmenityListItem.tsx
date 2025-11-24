/**
 * Amenity List Item Component
 * Phase 2.32.4 - Amenity List Items
 * ====================================
 *
 * Displays individual amenity in 4-row layout:
 * Row 1: Amenity Name + Action Buttons
 * Row 2: Category + Subtype badges
 * Row 3: Location (address, suburb, postcode)
 * Row 4: Distance (if available)
 *
 * Features:
 * - Compact 4-row design with proper visual hierarchy
 * - Graceful handling of missing data
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SchoolIcon from '@mui/icons-material/School';
import AttractionsIcon from '@mui/icons-material/Attractions';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SportsIcon from '@mui/icons-material/Sports';
import type { Amenity } from '../../store/slices/smartSearchSlice';

interface AmenityListItemProps {
  /** Amenity data object */
  amenity: Amenity;

  /** Whether amenity is currently selected */
  isSelected: boolean;

  /** Callback when amenity is selected */
  onSelect: (amenity: Amenity) => void;

  /** Callback when amenity is deselected */
  onDeselect: (amenityId: string) => void;

  /** Callback to center map on amenity */
  onCenter: (amenity: Amenity) => void;

  // Phase 2.32.1: Removed canSelectMore - single selection always allows selection
}

/**
 * Helper function to get category icon
 */
function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase();
  const iconStyle = { fontSize: '1rem' };

  if (normalized.includes('hospital')) return <LocalHospitalIcon sx={iconStyle} />;
  if (normalized.includes('librar')) return <LocalLibraryIcon sx={iconStyle} />;
  if (normalized.includes('shopping')) return <ShoppingCartIcon sx={iconStyle} />;
  if (normalized.includes('universit') || normalized.includes('tafe')) return <SchoolIcon sx={iconStyle} />;
  if (normalized.includes('tourist') || normalized.includes('attraction')) return <AttractionsIcon sx={iconStyle} />;
  if (normalized.includes('beach')) return <BeachAccessIcon sx={iconStyle} />;
  if (normalized.includes('sport')) return <SportsIcon sx={iconStyle} />;

  return null;
}

/**
 * Helper function to get category color
 */
function getCategoryColor(category: string): string {
  const normalized = category.toLowerCase();

  if (normalized.includes('hospital')) return '#d32f2f'; // Red
  if (normalized.includes('librar')) return '#7b1fa2'; // Purple
  if (normalized.includes('shopping')) return '#f57c00'; // Orange
  if (normalized.includes('universit') || normalized.includes('tafe')) return '#1976d2'; // Blue
  if (normalized.includes('tourist') || normalized.includes('attraction')) return '#388e3c'; // Green
  if (normalized.includes('beach')) return '#0288d1'; // Light Blue
  if (normalized.includes('sport')) return '#c2185b'; // Pink

  return '#666'; // Default gray
}

/**
 * Helper function to format category display name
 */
function formatCategoryName(category: string): string {
  // Convert underscores to spaces and capitalize
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * AmenityListItem Component
 * Phase 2.32.1: Single-selection pattern
 */
export const AmenityListItem: React.FC<AmenityListItemProps> = ({
  amenity,
  isSelected,
  onSelect,
  onDeselect,
  onCenter,
}) => {
  /**
   * Memoize attribute chips to avoid unnecessary re-renders
   */
  const attributeChips = useMemo(() => {
    const chips: React.ReactNode[] = [];

    // Category badge
    if (amenity.category) {
      chips.push(
        <Chip
          key="category"
          icon={getCategoryIcon(amenity.category) || undefined}
          label={formatCategoryName(amenity.category)}
          size="small"
          sx={{
            backgroundColor: getCategoryColor(amenity.category),
            color: '#fff',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
            '& .MuiChip-icon': {
              color: '#fff',
            },
          }}
        />
      );
    }

    // Subtype badge (if available)
    if (amenity.subtype) {
      chips.push(
        <Chip
          key="subtype"
          label={amenity.subtype}
          size="small"
          sx={{
            backgroundColor: '#666',
            color: '#fff',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        />
      );
    }

    return chips;
  }, [amenity.category, amenity.subtype]);

  /**
   * Handle card click (select/deselect)
   * Phase 2.32.1: Single-selection - always allow toggle
   */
  const handleCardClick = () => {
    if (isSelected) {
      onDeselect(amenity.id);
    } else {
      onSelect(amenity);
    }
  };

  /**
   * Handle map center button click
   */
  const handleCenterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onCenter(amenity);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        mb: 1,
        p: 1.5,
        cursor: 'pointer', // Phase 2.32.1: Always allow selection/deselection
        border: isSelected ? '2px solid #000' : '1px solid #e0e0e0',
        backgroundColor: isSelected ? '#f5f5f5' : '#fff',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: isSelected ? '#f5f5f5' : '#fafafa',
          borderColor: isSelected ? '#000' : '#999',
        },
      }}
    >
      {/* Row 1: Name + Actions */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#000',
            lineHeight: 1.3,
            flex: 1,
            mr: 1,
          }}
        >
          {amenity.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          {/* Map Center Button */}
          <IconButton
            size="small"
            onClick={handleCenterClick}
            title="Center on map"
            sx={{
              padding: 0.5,
              color: '#666',
              '&:hover': { color: '#000', backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <MapIcon sx={{ fontSize: '1rem' }} />
          </IconButton>

          {/* Select Button - Only show when not selected */}
          {!isSelected && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(amenity);
              }}
              title="Select amenity"
              sx={{
                padding: 0.5,
                color: '#666',
                '&:hover': { color: '#388e3c', backgroundColor: 'rgba(56,142,60,0.04)' },
              }}
            >
              <CheckCircleIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Row 2: Category + Subtype */}
      {attributeChips.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75, flexWrap: 'wrap' }}>
          {attributeChips}
        </Box>
      )}

      {/* Row 3: Address */}
      {(amenity.address || amenity.suburb || amenity.postcode) && (
        <Box sx={{ mb: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              color: '#666',
              lineHeight: 1.4,
            }}
          >
            {[amenity.address, amenity.suburb, amenity.postcode]
              .filter(Boolean)
              .join(', ')}
          </Typography>
        </Box>
      )}

      {/* Row 4: Distance */}
      {amenity.distance_km !== null && amenity.distance_km !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MapIcon sx={{ fontSize: '0.875rem', color: '#999' }} />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              color: '#999',
              fontWeight: 500,
            }}
          >
            {amenity.distance_km.toFixed(1)} km away
          </Typography>
        </Box>
      )}
    </Card>
  );
};
