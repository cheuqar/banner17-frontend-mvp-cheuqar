/**
 * CompactAmenitiesList Component - Phase 4: Amenities Selection UX Overhaul
 * ========================================================================
 *
 * Single-line amenity display component for dual disambiguation workflow.
 * This component provides a clean, minimal UI for amenity selection that is
 * NOT like smart suggestions style, per user requirements.
 *
 * Features:
 * - Single-line amenity names with hover tooltips for address information
 * - Clean, minimal UI design matching Style4-V2 guidelines
 * - Efficient selection interaction for dual disambiguation workflow
 * - Hover preview integration for additional amenity details
 *
 * Integration:
 * - Works with DualDisambiguationOrchestrator backend workflow
 * - Integrates with MapViewToggle for list ↔ map view switching
 * - Supports AmenitiesView unified component
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Tooltip,
  Paper,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocationOn,
  LocalHospital,
  LocalLibrary,
  ShoppingCart,
  School,
  Business,
  Place,
  // Beach, // Not available in @mui/icons-material, using Place instead
  FitnessCenter
} from '@mui/icons-material';

// Type definitions
export interface AmenityItem {
  id: string;
  name: string;
  address?: string;
  category: string;
  subtype?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  metadata?: Record<string, any>;
}

export interface CompactAmenitiesListProps {
  amenities: AmenityItem[];
  onSelect: (amenity: AmenityItem) => void;
  selectedAmenity?: AmenityItem;
  loading?: boolean;
  maxHeight?: number;
  showCategoryIcons?: boolean;
  enableHoverPreview?: boolean;
  className?: string;
}

// Category icon mapping
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'hospitals':
      return <LocalHospital fontSize="small" />;
    case 'libraries':
      return <LocalLibrary fontSize="small" />;
    case 'shopping':
      return <ShoppingCart fontSize="small" />;
    case 'schools':
      return <School fontSize="small" />;
    case 'universities_tafe':
      return <Business fontSize="small" />;
    case 'beaches':
      return <Place fontSize="small" />;
    case 'sports':
      return <FitnessCenter fontSize="small" />;
    case 'tourist_attractions':
      return <Place fontSize="small" />;
    default:
      return <LocationOn fontSize="small" />;
  }
};

// Category color mapping for minimal visual distinction
const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'hospitals':
      return '#e53e3e'; // Red
    case 'libraries':
      return '#3182ce'; // Blue
    case 'shopping':
      return '#38a169'; // Green
    case 'schools':
      return '#d69e2e'; // Orange
    case 'universities_tafe':
      return '#805ad5'; // Purple
    case 'beaches':
      return '#0bc5ea'; // Cyan
    case 'sports':
      return '#dd6b20'; // Orange-Red
    case 'tourist_attractions':
      return '#9f7aea'; // Light Purple
    default:
      return '#4a5568'; // Gray
  }
};

/**
 * CompactAmenitiesList - Single-line amenity display for dual disambiguation
 */
const CompactAmenitiesList: React.FC<CompactAmenitiesListProps> = ({
  amenities,
  onSelect,
  selectedAmenity,
  loading = false,
  maxHeight = 400,
  showCategoryIcons = true,
  enableHoverPreview = true,
  className
}) => {
  const theme = useTheme();
  const [hoveredAmenity, setHoveredAmenity] = useState<AmenityItem | null>(null);

  // Handle amenity selection
  const handleAmenitySelect = useCallback((amenity: AmenityItem) => {
    onSelect(amenity);
  }, [onSelect]);

  // Handle mouse events for hover preview
  const handleMouseEnter = useCallback((amenity: AmenityItem) => {
    if (enableHoverPreview) {
      setHoveredAmenity(amenity);
    }
  }, [enableHoverPreview]);

  const handleMouseLeave = useCallback(() => {
    if (enableHoverPreview) {
      setHoveredAmenity(null);
    }
  }, [enableHoverPreview]);

  // Render loading skeleton
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          maxHeight,
          overflow: 'auto',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
        className={className}
      >
        <Typography variant="h6" gutterBottom color="text.secondary">
          Loading amenities...
        </Typography>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Skeleton variant="text" width="90%" height={40} />
          </Box>
        ))}
      </Paper>
    );
  }

  // Render empty state
  if (!amenities || amenities.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: 'center',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
        className={className}
      >
        <LocationOn sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          No amenities found in this area
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden'
      }}
      className={className}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        pb: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.02)
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Select Amenity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {amenities.length} amenities found
        </Typography>
      </Box>

      {/* Amenities List */}
      <List
        sx={{
          maxHeight: maxHeight - 80, // Account for header
          overflow: 'auto',
          p: 0
        }}
      >
        {amenities.map((amenity, index) => {
          const isSelected = selectedAmenity?.id === amenity.id;
          const categoryColor = getCategoryColor(amenity.category);

          return (
            <ListItem key={amenity.id || index} disablePadding>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {amenity.name}
                    </Typography>
                    {amenity.address && (
                      <Typography variant="caption" display="block">
                        📍 {amenity.address}
                      </Typography>
                    )}
                    {amenity.distance_km && (
                      <Typography variant="caption" display="block">
                        📏 {amenity.distance_km.toFixed(1)} km away
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Category: {amenity.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                  </Box>
                }
                arrow
                placement="right"
                enterDelay={500}
              >
                <ListItemButton
                  onClick={() => handleAmenitySelect(amenity)}
                  onMouseEnter={() => handleMouseEnter(amenity)}
                  onMouseLeave={handleMouseLeave}
                  selected={isSelected}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    '&:hover': {
                      bgcolor: alpha(categoryColor, 0.08),
                      borderLeft: `3px solid ${categoryColor}`
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha(categoryColor, 0.12),
                      borderLeft: `3px solid ${categoryColor}`,
                      '&:hover': {
                        bgcolor: alpha(categoryColor, 0.16)
                      }
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {/* Category Icon */}
                  {showCategoryIcons && (
                    <Box
                      sx={{
                        mr: 1.5,
                        color: categoryColor,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {getCategoryIcon(amenity.category)}
                    </Box>
                  )}

                  {/* Amenity Information */}
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: isSelected ? 600 : 400,
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}
                      >
                        {amenity.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {/* Address (truncated for single-line display) */}
                        {amenity.address && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            📍 {amenity.address}
                          </Typography>
                        )}

                        {/* Distance and Category Chip */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          {amenity.distance_km && (
                            <Chip
                              label={`${amenity.distance_km.toFixed(1)} km`}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                borderColor: alpha(categoryColor, 0.5),
                                color: categoryColor
                              }}
                            />
                          )}
                          <Chip
                            label={amenity.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: alpha(categoryColor, 0.1),
                              color: categoryColor,
                              border: 'none'
                            }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default CompactAmenitiesList;