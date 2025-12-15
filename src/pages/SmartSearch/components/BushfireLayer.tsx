/**
 * Bushfire Prone Land Layer Component
 * Phase 2.55 - Heritage & Bushfire Overlay Layers
 * =====================================================
 *
 * Renders NSW bushfire prone land zones on the map as filled polygons.
 * Provides visual context for fire risk areas during property search.
 *
 * Features:
 * - Filled polygon rendering with heat-based color coding
 * - Dynamic loading based on visible viewport (bbox)
 * - Performance optimized with memoization
 * - Debounced API calls (500ms) during pan/zoom
 * - Tooltip on hover showing category and area
 *
 * Color Coding by Risk Category (heat-based):
 * - Vegetation Category 1 (Highest Risk): Deep Red (#DC2626)
 * - Vegetation Category 2 (High Risk): Orange (#EA580C)
 * - Vegetation Category 3 (Moderate Risk): Yellow (#CA8A04)
 * - Vegetation Buffer (Buffer Zone): Light Orange (#FDBA74)
 */

import React, { useMemo } from 'react';
import { Polygon, FeatureGroup, Tooltip } from 'react-leaflet';
import { useAppSelector } from '../../../store';
import { selectShowBushfireZones } from '../../../store/slices/smartSearchSlice';
import {
  useBushfireZones,
  MIN_ZOOM_FOR_BUSHFIRE,
  BUSHFIRE_COLORS,
  BUSHFIRE_FILL_OPACITY,
  type BushfireZone
} from '../../../hooks/useBushfireZones';
import type { BBoxBounds } from '../../../store/slices/smartSearchSlice';

// Re-export for use by other components
export { MIN_ZOOM_FOR_BUSHFIRE, BUSHFIRE_COLORS };

// Default bushfire style
const DEFAULT_BUSHFIRE_COLOR = '#F97316'; // Orange for unknown category

/**
 * Get color for bushfire category
 */
const getBushfireColor = (category: string): string => {
  return BUSHFIRE_COLORS[category] || DEFAULT_BUSHFIRE_COLOR;
};

/**
 * Format area in square meters to human readable format
 */
const formatArea = (areaSqm: number | null): string => {
  if (areaSqm === null || areaSqm === undefined) return 'N/A';
  if (areaSqm < 10000) {
    return `${areaSqm.toFixed(0)} m²`;
  } else if (areaSqm < 1000000) {
    return `${(areaSqm / 10000).toFixed(2)} ha`;
  } else {
    return `${(areaSqm / 1000000).toFixed(2)} km²`;
  }
};

/**
 * Convert boundary coordinates from [[[[lng, lat], ...]]] to Leaflet format [[[lat, lng], ...]]
 * Handles MultiPolygon format from PostGIS ST_AsGeoJSON
 */
const convertBoundaryToLeafletFormat = (
  boundaryCoords: number[][][][] | null
): [number, number][][][] => {
  if (!boundaryCoords) return [];

  return boundaryCoords.map(polygon =>
    polygon.map(ring =>
      ring.map(([lng, lat]) => [lat, lng] as [number, number])
    )
  );
};

interface BushfireLayerProps {
  mapBounds: BBoxBounds | null;
  zoomLevel: number;
}

/**
 * Bushfire Prone Land Layer Component
 *
 * Renders bushfire zones within the current map viewport.
 * Only renders when toggle is enabled (showBushfireZones = true).
 *
 * @param mapBounds - Current map viewport bounds from Redux
 * @param zoomLevel - Current map zoom level
 */
export const BushfireLayer: React.FC<BushfireLayerProps> = ({ mapBounds, zoomLevel }) => {
  // Get toggle state from Redux
  const showBushfireZones = useAppSelector(selectShowBushfireZones);

  // Fetch bushfire zones using the custom hook
  // Only fetches when enabled, bounds are available, and zoom >= MIN_ZOOM_FOR_BUSHFIRE
  const { zones, isLoading, error } = useBushfireZones({
    enabled: showBushfireZones,
    bounds: mapBounds,
    zoomLevel,
    maxResults: 200,
  });

  // Memoize converted coordinates for performance
  const processedZones = useMemo(() => {
    if (!zones || zones.length === 0) {
      return [];
    }

    return zones
      .filter(zone => zone.boundary_coords && zone.boundary_coords.length > 0)
      .map(zone => ({
        id: zone.id,
        fid: zone.fid,
        category: zone.category,
        areaSqm: zone.area_sqm,
        color: getBushfireColor(zone.category),
        positions: convertBoundaryToLeafletFormat(zone.boundary_coords),
      }));
  }, [zones]);

  // Don't render if toggle is off
  if (!showBushfireZones) {
    return null;
  }

  // Don't render if loading or error (silent fail - bushfire overlay is non-essential)
  if (isLoading || error) {
    // Log errors for debugging but don't show to user
    if (error) {
      console.warn('[BushfireLayer] Error fetching bushfire zones:', error);
    }
    return null;
  }

  // Don't render if no zones to display
  if (processedZones.length === 0) {
    return null;
  }

  return (
    <FeatureGroup>
      {processedZones.map(zone => (
        // Each bushfire zone may have multiple polygons (for complex boundaries)
        zone.positions.map((polygon, polygonIndex) => (
          <Polygon
            key={`bushfire-${zone.id}-poly-${polygonIndex}`}
            positions={polygon}
            pathOptions={{
              color: zone.color,
              weight: 1,
              opacity: 0.7,
              fillColor: zone.color,
              fillOpacity: BUSHFIRE_FILL_OPACITY,
            }}
          >
            <Tooltip sticky>
              <div style={{ maxWidth: '200px' }}>
                <strong style={{ color: zone.color }}>{zone.category}</strong>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Area: {formatArea(zone.areaSqm)}
                </div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  FID: {zone.fid}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        ))
      ))}
    </FeatureGroup>
  );
};

export default BushfireLayer;
