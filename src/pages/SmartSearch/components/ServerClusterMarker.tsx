/**
 * ServerClusterMarker Component
 * Phase 2.58: Renders server-side clusters as count-badge markers
 * Phase 2.60: Added click-to-zoom functionality and max-zoom popup callback
 * Phase 2.60.1: Updated to use teardrop style matching property cluster markers
 * Phase 2.60.2: Changed to zoom to max zoom (19) immediately and trigger immediate refresh
 *
 * These markers represent dense areas where the backend grouped properties
 * into clusters to reduce payload size. They show only a count badge,
 * not individual property details (since we don't have the property data).
 */

import React, { useMemo, useCallback } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { ServerCluster, CellBounds } from '../../../store/slices/smartSearchSlice';
import { createTeardropClusterIcon } from './PriceMarkerIcon';

// BBox bounds type for the callback
interface BBoxBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface ServerClusterMarkerProps {
  cluster: ServerCluster;
  // Phase 2.60.3: Updated to pass cell_bounds for accurate property fetch
  onMaxZoomClick?: (lat: number, lng: number, cellBounds?: CellBounds) => void;
  onZoomAndRefresh?: (bounds: BBoxBounds) => void; // NEW: Callback for immediate refresh after zoom
  themeColor?: string; // Theme primary dark color for consistency with property clusters
}

/**
 * ServerClusterMarker Component
 *
 * Renders a server-side cluster using teardrop/balloon pin style
 * matching the property cluster markers for visual consistency.
 * Phase 2.60.2: Clicking zooms to max zoom (19) and triggers immediate refresh.
 */
export const ServerClusterMarker: React.FC<ServerClusterMarkerProps> = ({
  cluster,
  onMaxZoomClick,
  onZoomAndRefresh,
  themeColor = '#0b2d2c' // Default to Theme-A primary dark
}) => {
  const map = useMap();

  // Memoize the icon using teardrop style (same as property clusters)
  const icon = useMemo(
    () => createTeardropClusterIcon(cluster.count, themeColor, 'server-cluster'),
    [cluster.count, themeColor]
  );

  // Phase 2.60.2: Click to zoom to max zoom (19) and trigger immediate refresh
  const handleClick = useCallback(() => {
    const currentZoom = map.getZoom();
    const lat = cluster.center.latitude;
    const lng = cluster.center.longitude;

    console.log(`[ServerClusterMarker] Cluster clicked at zoom ${currentZoom}, count: ${cluster.count}`);

    // At max zoom (19), show property list popup instead of zooming
    // Phase 2.60.3: Pass cell_bounds for accurate property fetch
    if (currentZoom >= 19 && onMaxZoomClick) {
      console.log(`[ServerClusterMarker] Max zoom reached, showing property popup at (${lat}, ${lng}), cell_bounds:`, cluster.cell_bounds);
      onMaxZoomClick(lat, lng, cluster.cell_bounds);
      return;
    }

    // Zoom to max zoom (19) immediately
    const targetZoom = 19;
    const clusterCenter: L.LatLngExpression = [lat, lng];

    console.log(`[ServerClusterMarker] Zooming to max zoom ${targetZoom} and triggering immediate refresh`);

    // Set up one-time listener for when zoom animation completes
    map.once('moveend', () => {
      if (onZoomAndRefresh) {
        // Get the new bounds after zoom
        const bounds = map.getBounds();
        const newBounds: BBoxBounds = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };
        console.log(`[ServerClusterMarker] Zoom complete, triggering immediate refresh with bounds:`, newBounds);
        onZoomAndRefresh(newBounds);
      }
    });

    // Perform the zoom animation
    map.flyTo(clusterCenter, targetZoom, { duration: 0.3 });
  }, [map, cluster.center.latitude, cluster.center.longitude, cluster.count, onMaxZoomClick, onZoomAndRefresh]);

  return (
    <Marker
      position={[cluster.center.latitude, cluster.center.longitude]}
      icon={icon}
      interactive={true}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Tooltip direction="top" offset={[0, -36]} opacity={0.9}>
        <div style={{ textAlign: 'center' }}>
          <strong>{cluster.count.toLocaleString()} properties</strong>
          <br />
          <span style={{ fontSize: '11px', color: '#666' }}>
            Click to {map.getZoom() >= 19 ? 'view properties' : 'zoom in & view'}
          </span>
        </div>
      </Tooltip>
    </Marker>
  );
};

export default ServerClusterMarker;
