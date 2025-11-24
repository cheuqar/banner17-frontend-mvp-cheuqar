/**
 * MapViewToggle Component - Phase 4: Amenities Selection UX Overhaul
 * ==================================================================
 *
 * Toggle button component for switching between list and map views in
 * the amenities selection workflow. Provides clean toggle interface
 * with Redux state management for user preference persistence.
 *
 * Features:
 * - Clean toggle button design matching Style4-V2 guidelines
 * - Redux state management for view preference persistence
 * - Smooth transitions between view modes
 * - Accessibility support with proper ARIA labels
 *
 * Integration:
 * - Works with CompactAmenitiesList and AmenitiesSelectionMap
 * - Integrates with AmenitiesView unified component
 * - Supports user preference persistence across sessions
 */

import React, { useCallback } from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  ViewList,
  Map as MapIcon
} from '@mui/icons-material';

// Type definitions
export type ViewMode = 'list' | 'map';

export interface MapViewToggleProps {
  viewMode: ViewMode;
  onToggleView: (viewMode: ViewMode) => void;
  disabled?: boolean;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * MapViewToggle - Clean toggle for list ↔ map view switching
 */
const MapViewToggle: React.FC<MapViewToggleProps> = ({
  viewMode,
  onToggleView,
  disabled = false,
  showLabel = true,
  size = 'medium',
  orientation = 'horizontal',
  className
}) => {
  const theme = useTheme();

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode | null) => {
      if (newViewMode && newViewMode !== viewMode) {
        onToggleView(newViewMode);
      }
    },
    [viewMode, onToggleView]
  );

  // Size configurations
  const sizeConfig = {
    small: { iconSize: 'small' as const, buttonSize: 'small' as const, spacing: 1 },
    medium: { iconSize: 'medium' as const, buttonSize: 'medium' as const, spacing: 1.5 },
    large: { iconSize: 'large' as const, buttonSize: 'large' as const, spacing: 2 }
  };

  const config = sizeConfig[size];

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        gap: config.spacing
      }}
    >
      {/* Label */}
      {showLabel && (
        <Typography
          variant={size === 'small' ? 'caption' : 'body2'}
          color="text.secondary"
          sx={{
            fontWeight: 500,
            whiteSpace: 'nowrap',
            ...(orientation === 'vertical' && { writingMode: 'vertical-rl', textOrientation: 'mixed' })
          }}
        >
          View
        </Typography>
      )}

      {/* Toggle Button Group */}
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewModeChange}
        aria-label="amenities view mode"
        disabled={disabled}
        orientation={orientation}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: '6px !important',
            px: size === 'small' ? 1 : 1.5,
            py: size === 'small' ? 0.5 : 0.75,
            margin: '2px',
            minWidth: size === 'small' ? 36 : size === 'medium' ? 44 : 52,
            minHeight: size === 'small' ? 32 : size === 'medium' ? 40 : 48,
            color: theme.palette.text.secondary,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              transform: 'translateY(-1px)'
            },
            '&.Mui-selected': {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-1px)'
              }
            },
            '&.Mui-disabled': {
              color: theme.palette.text.disabled,
              bgcolor: 'transparent'
            }
          }
        }}
      >
        {/* List View Button */}
        <Tooltip title="List View" arrow placement="top">
          <ToggleButton
            value="list"
            aria-label="list view"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <ViewList fontSize={config.iconSize} />
            {size === 'large' && (
              <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                List
              </Typography>
            )}
          </ToggleButton>
        </Tooltip>

        {/* Map View Button */}
        <Tooltip title="Map View" arrow placement="top">
          <ToggleButton
            value="map"
            aria-label="map view"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <MapIcon fontSize={config.iconSize} />
            {size === 'large' && (
              <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                Map
              </Typography>
            )}
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>

      {/* View Mode Indicator */}
      {size === 'large' && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          >
            {viewMode} View Active
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapViewToggle;