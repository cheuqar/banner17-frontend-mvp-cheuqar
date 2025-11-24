/**
 * CatchmentBoundary Component - Interactive School Catchment Map Component
 * Enhanced Spatial Search Phase 3 - Frontend Implementation
 * =========================================================
 *
 * React component for rendering school catchment boundaries on maps with:
 * - Interactive polygon overlays for primary and secondary schools
 * - Toggle controls for catchment visibility
 * - School information popups on click
 * - Style4-V2 design system integration
 * - Performance optimized for complex polygon rendering
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Polygon, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Fade,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  School as SchoolIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

import type {
  CatchmentBoundaryFeature,
  CatchmentDisplayOptions,
} from '../../types/catchment';
import {
  DEFAULT_CATCHMENT_DISPLAY_OPTIONS,
  extractCatchmentCoordinates,
  calculateCatchmentBounds,
} from '../../types/catchment';

/**
 * Props for individual catchment boundary polygon
 */
interface CatchmentPolygonProps {
  /** Catchment boundary data */
  catchment: CatchmentBoundaryFeature;

  /** Display options for styling */
  displayOptions: CatchmentDisplayOptions;

  /** Whether this polygon is currently selected */
  isSelected: boolean;

  /** Callback when polygon is clicked */
  onClick: (catchment: CatchmentBoundaryFeature) => void;

  /** Whether polygon should be visible */
  visible: boolean;
}

/**
 * Individual catchment boundary polygon component
 */
const CatchmentPolygon: React.FC<CatchmentPolygonProps> = ({
  catchment,
  displayOptions,
  isSelected,
  onClick,
  visible,
}) => {
  const theme = useTheme();

  // Extract coordinates for Leaflet Polygon
  const coordinates = useMemo(() => {
    return extractCatchmentCoordinates(catchment);
  }, [catchment]);

  // Determine colors based on catchment level
  const polygonColor = catchment.properties.catchment_level === 'primary'
    ? displayOptions.primaryColor
    : displayOptions.secondaryColor;

  // Enhanced styling for selected state
  const polygonStyle = useMemo(() => ({
    color: polygonColor,
    weight: isSelected ? displayOptions.weight + 1 : displayOptions.weight,
    opacity: displayOptions.opacity,
    fillColor: polygonColor,
    fillOpacity: isSelected ? displayOptions.fillOpacity * 2 : displayOptions.fillOpacity,
    dashArray: isSelected ? '5, 5' : undefined,
  }), [polygonColor, displayOptions, isSelected]);

  const handleClick = useCallback(() => {
    onClick(catchment);
  }, [catchment, onClick]);

  if (!visible || coordinates.length === 0) {
    return null;
  }

  return (
    <Polygon
      positions={coordinates as LatLngExpression[]}
      pathOptions={polygonStyle}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
};

/**
 * Props for catchment toggle controls
 */
interface CatchmentToggleControlsProps {
  /** Whether primary catchments are visible */
  showPrimary: boolean;

  /** Whether secondary catchments are visible */
  showSecondary: boolean;

  /** Callback when primary toggle changes */
  onPrimaryToggle: (show: boolean) => void;

  /** Callback when secondary toggle changes */
  onSecondaryToggle: (show: boolean) => void;

  /** Count of primary catchments */
  primaryCount: number;

  /** Count of secondary catchments */
  secondaryCount: number;
}

/**
 * Toggle controls for catchment visibility
 */
const CatchmentToggleControls: React.FC<CatchmentToggleControlsProps> = ({
  showPrimary,
  showSecondary,
  onPrimaryToggle,
  onSecondaryToggle,
  primaryCount,
  secondaryCount,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
        minWidth: 280,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        boxShadow: theme.shadows[4],
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <SchoolIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="h3">
            School Catchments
          </Typography>
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showPrimary}
                onChange={(e) => onPrimaryToggle(e.target.checked)}
                sx={{
                  '& .MuiSwitch-thumb': {
                    backgroundColor: showPrimary ? DEFAULT_CATCHMENT_DISPLAY_OPTIONS.primaryColor : undefined,
                  },
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center">
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Primary Schools
                </Typography>
                <Chip
                  label={primaryCount}
                  size="small"
                  variant="outlined"
                  sx={{
                    backgroundColor: showPrimary
                      ? `${DEFAULT_CATCHMENT_DISPLAY_OPTIONS.primaryColor}20`
                      : 'transparent',
                    borderColor: DEFAULT_CATCHMENT_DISPLAY_OPTIONS.primaryColor,
                  }}
                />
              </Box>
            }
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showSecondary}
                onChange={(e) => onSecondaryToggle(e.target.checked)}
                sx={{
                  '& .MuiSwitch-thumb': {
                    backgroundColor: showSecondary ? DEFAULT_CATCHMENT_DISPLAY_OPTIONS.secondaryColor : undefined,
                  },
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center">
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Secondary Schools
                </Typography>
                <Chip
                  label={secondaryCount}
                  size="small"
                  variant="outlined"
                  sx={{
                    backgroundColor: showSecondary
                      ? `${DEFAULT_CATCHMENT_DISPLAY_OPTIONS.secondaryColor}20`
                      : 'transparent',
                    borderColor: DEFAULT_CATCHMENT_DISPLAY_OPTIONS.secondaryColor,
                  }}
                />
              </Box>
            }
          />
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Props for school information popup
 */
interface SchoolInfoPopupProps {
  /** Selected catchment data */
  catchment: CatchmentBoundaryFeature;

  /** Whether popup is open */
  isOpen: boolean;

  /** Callback when popup closes */
  onClose: () => void;
}

/**
 * School information popup component
 */
const SchoolInfoPopup: React.FC<SchoolInfoPopupProps> = ({
  catchment,
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const { school_name, catchment_level, school_metadata } = catchment.properties;

  if (!isOpen) return null;

  const levelColor = catchment_level === 'primary'
    ? DEFAULT_CATCHMENT_DISPLAY_OPTIONS.primaryColor
    : DEFAULT_CATCHMENT_DISPLAY_OPTIONS.secondaryColor;

  return (
    <Popup>
      <Card sx={{ maxWidth: 320, backgroundColor: 'white' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {school_name}
              </Typography>
              <Chip
                label={`${catchment_level} School`.replace(/\b\w/g, l => l.toUpperCase())}
                size="small"
                sx={{
                  backgroundColor: `${levelColor}20`,
                  color: levelColor,
                  fontWeight: 'medium',
                }}
              />
            </Box>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: theme.palette.grey[500] }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Address:</strong> {school_metadata.address}, {school_metadata.suburb} {school_metadata.postcode}
            </Typography>

            {school_metadata.subtype && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Type:</strong> {school_metadata.subtype}
              </Typography>
            )}

            {school_metadata.school_details?.selective_school && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Selective:</strong> {school_metadata.school_details.selective_school}
              </Typography>
            )}

            {school_metadata.school_details?.gender && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Gender:</strong> {school_metadata.school_details.gender}
              </Typography>
            )}

            {school_metadata.calendar_year && (
              <Typography variant="body2" color="text.secondary">
                <strong>Data Year:</strong> {school_metadata.calendar_year}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Popup>
  );
};

/**
 * Props for main CatchmentBoundary component
 */
export interface CatchmentBoundaryProps {
  /** Array of catchment boundaries to display */
  catchmentBoundaries: CatchmentBoundaryFeature[];

  /** Whether to show toggle controls */
  showControls?: boolean;

  /** Initial visibility state for primary schools */
  initialShowPrimary?: boolean;

  /** Initial visibility state for secondary schools */
  initialShowSecondary?: boolean;

  /** Custom display options */
  displayOptions?: Partial<CatchmentDisplayOptions>;

  /** Whether to auto-fit map bounds to catchments */
  autoFitBounds?: boolean;

  /** Callback when a catchment is selected */
  onCatchmentSelect?: (catchment: CatchmentBoundaryFeature | null) => void;

  /** Custom styling */
  className?: string;
}

/**
 * Main CatchmentBoundary component for displaying school catchment boundaries
 */
export const CatchmentBoundary: React.FC<CatchmentBoundaryProps> = ({
  catchmentBoundaries,
  showControls = true,
  initialShowPrimary = true,
  initialShowSecondary = true,
  displayOptions = {},
  autoFitBounds = false,
  onCatchmentSelect,
  className,
}) => {
  const map = useMap();
  const [showPrimary, setShowPrimary] = useState(initialShowPrimary);
  const [showSecondary, setShowSecondary] = useState(initialShowSecondary);
  const [selectedCatchment, setSelectedCatchment] = useState<CatchmentBoundaryFeature | null>(null);

  // Merge display options with defaults
  const mergedDisplayOptions = useMemo(() => ({
    ...DEFAULT_CATCHMENT_DISPLAY_OPTIONS,
    ...displayOptions,
  }), [displayOptions]);

  // Separate primary and secondary catchments
  const { primaryCatchments, secondaryCatchments } = useMemo(() => {
    const primary = catchmentBoundaries.filter(c => c.properties.catchment_level === 'primary');
    const secondary = catchmentBoundaries.filter(c => c.properties.catchment_level === 'secondary');
    return { primaryCatchments: primary, secondaryCatchments: secondary };
  }, [catchmentBoundaries]);

  // Auto-fit map bounds to catchments
  useEffect(() => {
    if (autoFitBounds && catchmentBoundaries.length > 0) {
      const bounds = calculateCatchmentBounds(catchmentBoundaries);
      if (bounds && map) {
        const leafletBounds = new LatLngBounds(bounds[0], bounds[1]);
        map.fitBounds(leafletBounds, { padding: [50, 50] });
      }
    }
  }, [catchmentBoundaries, autoFitBounds, map]);

  // Handle catchment selection
  const handleCatchmentClick = useCallback((catchment: CatchmentBoundaryFeature) => {
    setSelectedCatchment(catchment);
    onCatchmentSelect?.(catchment);
  }, [onCatchmentSelect]);

  // Handle popup close
  const handlePopupClose = useCallback(() => {
    setSelectedCatchment(null);
    onCatchmentSelect?.(null);
  }, [onCatchmentSelect]);

  return (
    <div className={className}>
      {/* Toggle Controls */}
      {showControls && (
        <CatchmentToggleControls
          showPrimary={showPrimary}
          showSecondary={showSecondary}
          onPrimaryToggle={setShowPrimary}
          onSecondaryToggle={setShowSecondary}
          primaryCount={primaryCatchments.length}
          secondaryCount={secondaryCatchments.length}
        />
      )}

      {/* Primary School Catchments */}
      {showPrimary && primaryCatchments.map((catchment) => (
        <CatchmentPolygon
          key={catchment.properties.catchment_id}
          catchment={catchment}
          displayOptions={mergedDisplayOptions}
          isSelected={selectedCatchment?.properties.catchment_id === catchment.properties.catchment_id}
          onClick={handleCatchmentClick}
          visible={showPrimary}
        />
      ))}

      {/* Secondary School Catchments */}
      {showSecondary && secondaryCatchments.map((catchment) => (
        <CatchmentPolygon
          key={catchment.properties.catchment_id}
          catchment={catchment}
          displayOptions={mergedDisplayOptions}
          isSelected={selectedCatchment?.properties.catchment_id === catchment.properties.catchment_id}
          onClick={handleCatchmentClick}
          visible={showSecondary}
        />
      ))}

      {/* School Information Popup */}
      {selectedCatchment && (
        <SchoolInfoPopup
          catchment={selectedCatchment}
          isOpen={!!selectedCatchment}
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
};

export default CatchmentBoundary;