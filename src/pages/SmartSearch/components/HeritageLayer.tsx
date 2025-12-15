/**
 * Heritage Site Layer Component
 * Phase 2.55 - Heritage & Bushfire Overlay Layers
 * =====================================================
 *
 * Renders NSW heritage sites on the map as filled polygons.
 * Provides visual context for heritage-listed areas during property search.
 *
 * Features:
 * - Filled polygon rendering with color-coded significance levels
 * - Dynamic loading based on visible viewport (bbox)
 * - Performance optimized with memoization
 * - Debounced API calls (500ms) during pan/zoom
 * - Tooltip on hover showing heritage name and significance
 *
 * Color Coding by Significance:
 * - Local: Blue (#3B82F6)
 * - State: Orange (#F97316)
 * - National: Red (#EF4444)
 * - World: Purple (#8B5CF6)
 */

import React, { useMemo } from 'react';
import { Polygon, FeatureGroup, Tooltip } from 'react-leaflet';
import { useAppSelector } from '../../../store';
import { selectShowHeritageSites } from '../../../store/slices/smartSearchSlice';
import {
  useHeritageSites,
  MIN_ZOOM_FOR_HERITAGE,
  HERITAGE_COLORS,
  type HeritageItem
} from '../../../hooks/useHeritageSites';
import type { BBoxBounds } from '../../../store/slices/smartSearchSlice';

// Re-export for use by other components
export { MIN_ZOOM_FOR_HERITAGE, HERITAGE_COLORS };

// Default heritage style
const DEFAULT_HERITAGE_COLOR = '#6B7280'; // Gray for unknown significance

/**
 * Get color for heritage significance level
 */
const getHeritageColor = (significance: string | null): string => {
  if (!significance) return DEFAULT_HERITAGE_COLOR;
  return HERITAGE_COLORS[significance] || DEFAULT_HERITAGE_COLOR;
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

interface HeritageLayerProps {
  mapBounds: BBoxBounds | null;
  zoomLevel: number;
}

/**
 * Heritage Site Layer Component
 *
 * Renders heritage sites within the current map viewport.
 * Only renders when toggle is enabled (showHeritageSites = true).
 *
 * @param mapBounds - Current map viewport bounds from Redux
 * @param zoomLevel - Current map zoom level
 */
export const HeritageLayer: React.FC<HeritageLayerProps> = ({ mapBounds, zoomLevel }) => {
  // Get toggle state from Redux
  const showHeritageSites = useAppSelector(selectShowHeritageSites);

  // Fetch heritage sites using the custom hook
  // Only fetches when enabled, bounds are available, and zoom >= MIN_ZOOM_FOR_HERITAGE
  const { items, isLoading, error } = useHeritageSites({
    enabled: showHeritageSites,
    bounds: mapBounds,
    zoomLevel,
    maxResults: 100,
  });

  // Memoize converted coordinates for performance
  const processedItems = useMemo(() => {
    if (!items || items.length === 0) {
      return [];
    }

    return items
      .filter(item => item.boundary_coords && item.boundary_coords.length > 0)
      .map(item => ({
        id: item.id,
        name: item.heritage_name || 'Unknown Heritage Site',
        significance: item.significance,
        layerClass: item.layer_class,
        lgaName: item.lga_name,
        color: getHeritageColor(item.significance),
        positions: convertBoundaryToLeafletFormat(item.boundary_coords),
      }));
  }, [items]);

  // Don't render if toggle is off
  if (!showHeritageSites) {
    return null;
  }

  // Don't render if loading or error (silent fail - heritage overlay is non-essential)
  if (isLoading || error) {
    // Log errors for debugging but don't show to user
    if (error) {
      console.warn('[HeritageLayer] Error fetching heritage sites:', error);
    }
    return null;
  }

  // Don't render if no items to display
  if (processedItems.length === 0) {
    return null;
  }

  return (
    <FeatureGroup>
      {processedItems.map(item => (
        // Each heritage site may have multiple polygons (for complex boundaries)
        item.positions.map((polygon, polygonIndex) => (
          <Polygon
            key={`heritage-${item.id}-poly-${polygonIndex}`}
            positions={polygon}
            pathOptions={{
              color: item.color,
              weight: 2,
              opacity: 0.8,
              fillColor: item.color,
              fillOpacity: 0.3,
            }}
          >
            <Tooltip sticky>
              <div style={{ maxWidth: '200px' }}>
                <strong>{item.name}</strong>
                {item.significance && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Significance: {item.significance}
                  </div>
                )}
                {item.lgaName && (
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    LGA: {item.lgaName}
                  </div>
                )}
              </div>
            </Tooltip>
          </Polygon>
        ))
      ))}
    </FeatureGroup>
  );
};

export default HeritageLayer;
