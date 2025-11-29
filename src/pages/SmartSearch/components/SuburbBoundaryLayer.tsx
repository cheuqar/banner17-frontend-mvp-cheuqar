/**
 * Suburb Boundary Layer Component
 * Phase 2.38 - Suburb Boundaries Overlay
 * =====================================================
 *
 * Renders NSW suburb boundaries on the map as outline-only polylines.
 * Provides visual context for geographic divisions during property search.
 *
 * Features:
 * - Outline-only rendering (no fill) using Polyline
 * - Dynamic loading based on visible viewport (bbox)
 * - Performance optimized with memoization
 * - Debounced API calls (500ms) during pan/zoom
 *
 * Styling:
 * - Gray (#666666) outline color
 * - 1.5px stroke width
 * - 60% opacity
 * - No fill (outline only)
 *
 * @see handoff/features/smart-search/PHASE-2.38-SUBURB-BOUNDARIES-SPEC.md
 */

import React, { useMemo } from 'react';
import { Polyline, FeatureGroup } from 'react-leaflet';
import { useAppSelector } from '../../../store';
import { selectShowSuburbBoundaries } from '../../../store/slices/smartSearchSlice';
import { useSuburbBoundaries, MIN_ZOOM_FOR_SUBURB_BOUNDARIES } from '../../../hooks/useSuburbBoundaries';
import type { BBoxBounds } from '../../../store/slices/smartSearchSlice';

// Re-export for use by other components
export { MIN_ZOOM_FOR_SUBURB_BOUNDARIES };

// Suburb boundary styling constants
// Neutral gray outline that doesn't compete with property markers
const SUBURB_BOUNDARY_STYLE = {
  color: '#333333',      // Dark gray - more solid/visible
  weight: 3,             // Medium-thick line
  opacity: 0.85,         // More opaque for solid appearance
  fill: false,           // No fill - outline only
  interactive: false,    // No click/hover interactions
};

/**
 * Convert boundary coordinates from [[[lng, lat], ...]] to Leaflet format [[lat, lng], ...]
 * Handles the coordinate system conversion from WGS84 (lng, lat) to Leaflet (lat, lng)
 */
const convertBoundaryToLeafletFormat = (
  boundaryCoords: number[][][]
): [number, number][][] => {
  return boundaryCoords.map(ring =>
    ring.map(([lng, lat]) => [lat, lng] as [number, number])
  );
};

interface SuburbBoundaryLayerProps {
  mapBounds: BBoxBounds | null;
  zoomLevel: number;
}

/**
 * Suburb Boundary Layer Component
 *
 * Renders suburb boundaries within the current map viewport.
 * Only renders when toggle is enabled (showSuburbBoundaries = true).
 *
 * @param mapBounds - Current map viewport bounds from Redux
 */
export const SuburbBoundaryLayer: React.FC<SuburbBoundaryLayerProps> = ({ mapBounds, zoomLevel }) => {
  // Get toggle state from Redux
  const showSuburbBoundaries = useAppSelector(selectShowSuburbBoundaries);

  // Fetch suburb boundaries using the custom hook
  // Only fetches when enabled, bounds are available, and zoom >= MIN_ZOOM_FOR_SUBURB_BOUNDARIES
  const { suburbs, isLoading, error } = useSuburbBoundaries({
    enabled: showSuburbBoundaries,
    bounds: mapBounds,
    zoomLevel,
    maxResults: 100,
  });

  // Memoize converted coordinates for performance
  const processedSuburbs = useMemo(() => {
    if (!suburbs || suburbs.length === 0) {
      return [];
    }

    return suburbs
      .filter(suburb => suburb.boundary_coords && suburb.boundary_coords.length > 0)
      .map(suburb => ({
        name: suburb.suburb_name,
        positions: convertBoundaryToLeafletFormat(suburb.boundary_coords),
      }));
  }, [suburbs]);

  // Don't render if toggle is off
  if (!showSuburbBoundaries) {
    return null;
  }

  // Don't render if loading or error (silent fail - boundaries are non-essential)
  if (isLoading || error) {
    // Log errors for debugging but don't show to user
    if (error) {
      console.warn('[SuburbBoundaryLayer] Error fetching suburbs:', error);
    }
    return null;
  }

  // Don't render if no suburbs to display
  if (processedSuburbs.length === 0) {
    return null;
  }

  return (
    <FeatureGroup>
      {processedSuburbs.map(suburb => (
        // Each suburb may have multiple rings (for complex boundaries or holes)
        suburb.positions.map((ring, ringIndex) => (
          <Polyline
            key={`suburb-${suburb.name}-ring-${ringIndex}`}
            positions={ring}
            pathOptions={SUBURB_BOUNDARY_STYLE}
          />
        ))
      ))}
    </FeatureGroup>
  );
};

export default SuburbBoundaryLayer;
