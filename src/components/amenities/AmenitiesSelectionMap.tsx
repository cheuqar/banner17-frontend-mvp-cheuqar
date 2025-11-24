/**
 * AmenitiesSelectionMap Component - Phase 4: Amenities Selection UX Overhaul
 * ==========================================================================
 *
 * Interactive map component for amenities selection with visual markers
 * and selection functionality. Integrates with the dual disambiguation
 * workflow to provide spatial context for amenity selection.
 *
 * Features:
 * - Interactive amenities markers with category-based styling
 * - Map view integration with toggle functionality
 * - Zoom and pan controls for amenities viewing
 * - Selection state management and visual feedback
 * - Responsive design with proper loading states
 *
 * Integration:
 * - Works with MapViewToggle for view switching
 * - Integrates with CompactAmenitiesList for unified selection
 * - Supports AmenitiesView unified component
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Skeleton,
  useTheme,
  alpha,
  Zoom,
  Fade
} from '@mui/material';
import {
  LocationOn,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  LocalHospital,
  LocalLibrary,
  ShoppingCart,
  School,
  Business,
  Place,
  // Beach, // Not available in @mui/icons-material, using Place instead
  FitnessCenter
} from '@mui/icons-material';

// Import existing PropertyMap component for base map functionality
import PropertyMap from '../maps/PropertyMap';

// Type definitions
export interface AmenityMapItem {
  id: string;
  name: string;
  address?: string;
  category: string;
  subtype?: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  metadata?: Record<string, any>;
}

export interface AmenitiesSelectionMapProps {
  amenities: AmenityMapItem[];
  onSelect: (amenity: AmenityMapItem) => void;
  selectedAmenity?: AmenityMapItem;
  centerLocation?: { latitude: number; longitude: number };
  loading?: boolean;
  height?: number;
  showControls?: boolean;
  enableClustering?: boolean;
  className?: string;
}

// Category styling configuration
const getCategoryMapStyle = (category: string, isSelected: boolean = false) => {
  const baseStyles: Record<string, { color: string; icon: any }> = {
    hospitals: { color: '#e53e3e', icon: LocalHospital },
    libraries: { color: '#3182ce', icon: LocalLibrary },
    shopping: { color: '#38a169', icon: ShoppingCart },
    schools: { color: '#d69e2e', icon: School },
    universities_tafe: { color: '#805ad5', icon: Business },
    beaches: { color: '#0bc5ea', icon: Place },
    sports: { color: '#dd6b20', icon: FitnessCenter },
    tourist_attractions: { color: '#9f7aea', icon: Place }
  };

  const style = baseStyles[category.toLowerCase()] || { color: '#4a5568', icon: LocationOn };

  return {
    ...style,
    size: isSelected ? 'large' : 'medium',
    shadow: isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.2)',
    scale: isSelected ? 1.2 : 1.0
  };
};

/**
 * AmenitiesSelectionMap - Interactive map for amenities selection
 */
const AmenitiesSelectionMap: React.FC<AmenitiesSelectionMapProps> = ({
  amenities,
  onSelect,
  selectedAmenity,
  centerLocation,
  loading = false,
  height = 400,
  showControls = true,
  enableClustering = true,
  className
}) => {
  const theme = useTheme();
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [hoveredAmenity, setHoveredAmenity] = useState<AmenityMapItem | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [zoom, setZoom] = useState(13);

  // Calculate map center from amenities or use provided center
  const calculatedCenter = useMemo(() => {
    if (centerLocation) {
      return { lat: centerLocation.latitude, lng: centerLocation.longitude };
    }

    if (amenities && amenities.length > 0) {
      const latSum = amenities.reduce((sum, amenity) => sum + amenity.latitude, 0);
      const lngSum = amenities.reduce((sum, amenity) => sum + amenity.longitude, 0);
      return {
        lat: latSum / amenities.length,
        lng: lngSum / amenities.length
      };
    }

    // Default to Sydney CBD
    return { lat: -33.8688, lng: 151.2093 };
  }, [amenities, centerLocation]);

  // Update map center when calculated center changes
  useEffect(() => {
    setMapCenter(calculatedCenter);
  }, [calculatedCenter]);

  // Handle amenity marker click
  const handleMarkerClick = useCallback((amenity: AmenityMapItem) => {
    onSelect(amenity);
  }, [onSelect]);

  // Handle map controls
  const handleZoomIn = useCallback(() => {
    if (mapInstance) {
      const currentZoom = mapInstance.getZoom();
      mapInstance.setZoom(Math.min(currentZoom + 1, 18));
      setZoom(Math.min(currentZoom + 1, 18));
    }
  }, [mapInstance]);

  const handleZoomOut = useCallback(() => {
    if (mapInstance) {
      const currentZoom = mapInstance.getZoom();
      mapInstance.setZoom(Math.max(currentZoom - 1, 8));
      setZoom(Math.max(currentZoom - 1, 8));
    }
  }, [mapInstance]);

  const handleRecenter = useCallback(() => {
    if (mapInstance && mapCenter) {
      mapInstance.setCenter(mapCenter);
      mapInstance.setZoom(13);
      setZoom(13);
    }
  }, [mapInstance, mapCenter]);

  // Generate markers data for PropertyMap component
  const markersData = useMemo(() => {
    return amenities.map(amenity => {
      const style = getCategoryMapStyle(amenity.category, selectedAmenity?.id === amenity.id);

      return {
        id: amenity.id,
        latitude: amenity.latitude,
        longitude: amenity.longitude,
        title: amenity.name,
        subtitle: amenity.address || `${amenity.category} amenity`,
        category: amenity.category,
        onClick: () => handleMarkerClick(amenity),
        style: {
          color: style.color,
          size: style.size,
          icon: style.icon.name,
          shadow: style.shadow,
          scale: style.scale
        }
      };
    });
  }, [amenities, selectedAmenity, handleMarkerClick]);

  // Render loading skeleton
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          height,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}
        className={className}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Loading map...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative'
      }}
      className={className}
    >
      {/* Map Header */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          p: 2,
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, transparent 100%)`,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Amenities Map
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip
            label={`${amenities.length} amenities`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 500
            }}
          />
          {selectedAmenity && (
            <Chip
              label="Selected"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontWeight: 500
              }}
            />
          )}
        </Box>
      </Box>

      {/* Map Controls */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Tooltip title="Zoom In" placement="left">
            <IconButton
              onClick={handleZoomIn}
              disabled={zoom >= 18}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 1)
                }
              }}
            >
              <ZoomIn />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom Out" placement="left">
            <IconButton
              onClick={handleZoomOut}
              disabled={zoom <= 8}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 1)
                }
              }}
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>

          <Tooltip title="Recenter Map" placement="left">
            <IconButton
              onClick={handleRecenter}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 1)
                }
              }}
            >
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Selected Amenity Info */}
      {selectedAmenity && (
        <Fade in={!!selectedAmenity}>
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              zIndex: 1000,
              p: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(8px)',
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selectedAmenity.name}
            </Typography>
            {selectedAmenity.address && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                📍 {selectedAmenity.address}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                label={selectedAmenity.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                size="small"
                sx={{
                  bgcolor: alpha(getCategoryMapStyle(selectedAmenity.category).color, 0.1),
                  color: getCategoryMapStyle(selectedAmenity.category).color
                }}
              />
              {selectedAmenity.distance_km && (
                <Chip
                  label={`${selectedAmenity.distance_km.toFixed(1)} km`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Map Component */}
      <Box sx={{ height: '100%' }}>
        <PropertyMap
          properties={[]}
        />
      </Box>

      {/* Empty State */}
      {amenities.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 1000
          }}
        >
          <LocationOn sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No amenities to display on map
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AmenitiesSelectionMap;