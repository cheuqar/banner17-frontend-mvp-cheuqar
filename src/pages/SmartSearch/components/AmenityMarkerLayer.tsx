/**
 * Amenity Marker Layer Component
 * Phase 2.32.5 - Map Layer: Amenity Markers
 * =====================================================
 *
 * Renders amenity markers on the map with:
 * - Toggle visibility control
 * - Highlighting for selected amenities (max 5)
 * - Marker popups with amenity info and action buttons
 * - Category-based icon colors
 * - Performance optimization (max 100 markers)
 * - Automatic updates on bounds change
 */

import React, { useMemo, useCallback } from 'react';
import { Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAppSelector, useAppDispatch } from '../../../store';
import { toggleAmenitySelection } from '../../../store/slices/smartSearchSlice';
import { AmenityMarkerPopup } from './AmenityMarkerPopup';
import L from 'leaflet';
import './AmenityMarkerLayer.css';

// Maximum number of markers to render for performance
const MAX_MARKERS = 100;

/**
 * Get category color for markers
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
  if (normalized.includes('child') || normalized.includes('care')) return '#e91e63'; // Pink (Child Care)
  return '#666'; // Default gray
};

/**
 * Create amenity cluster icon
 * @param cluster - Leaflet MarkerCluster instance
 * @returns Leaflet DivIcon
 */
const createAmenityClusterIcon = (cluster: any): L.DivIcon => {
  const count = cluster.getChildCount();

  const html = `
    <div class="amenity-cluster-marker">
      <div class="amenity-cluster-label">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#0b2d2c"
          xmlns="http://www.w3.org/2000/svg"
          style="flex-shrink: 0;"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span class="amenity-cluster-count">${count} amenities</span>
      </div>
      <div class="amenity-cluster-pointer"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-amenity-cluster-marker',
    iconSize: [120, 50],
    iconAnchor: [60, 50],
    popupAnchor: [0, -50]
  });
};

/**
 * Calculate dynamic cluster radius based on zoom level
 * @param zoom - Current map zoom level
 * @returns Cluster radius in pixels
 */
const getAmenityClusterRadius = (zoom: number): number => {
  if (zoom <= 10) return 80;   // World/country view - larger clusters
  if (zoom <= 12) return 60;   // Regional view
  if (zoom <= 14) return 40;   // City/suburb view
  if (zoom <= 16) return 25;   // Neighborhood view
  return 15;                    // Street view - small clusters
};

/**
 * Create amenity marker icon
 * @param category - Amenity category
 * @param selected - Whether this amenity is selected
 * @returns Leaflet DivIcon
 */
const createAmenityMarkerIcon = (category: string, selected: boolean): L.DivIcon => {
  const iconColor = selected ? '#0b2d2c' : getCategoryColor(category);
  const size = selected ? 32 : 28;

  return L.divIcon({
    className: 'amenity-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
      ">
        <svg
          width="${size}"
          height="${size}"
          viewBox="0 0 24 24"
          fill="${iconColor}"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

/**
 * Amenity Marker Layer Component
 */
export const AmenityMarkerLayer: React.FC = () => {
  const map = useMap();
  const zoom = map.getZoom();
  const clusterRadius = getAmenityClusterRadius(zoom);

  const dispatch = useAppDispatch();

  // Redux state
  const {
    data: amenities,
    selectedAmenityId, // Phase 2.32.1: Single selection
    showAmenitiesOnMap,
  } = useAppSelector(state => state.smartSearch.amenities);

  /**
   * Handle marker click - select/deselect amenity
   */
  const handleMarkerClick = useCallback((amenityId: string, isSelected: boolean) => {
    console.log('[AmenityMarkerLayer] Marker clicked:', {
      amenityId,
      isSelected,
    });

    dispatch(toggleAmenitySelection(amenityId));
  }, [dispatch]);

  // Memoize markers to render (max 100, valid coordinates only)
  const markersToRender = useMemo(() => {
    const filtered = amenities
      .filter((amenity) => amenity.latitude != null && amenity.longitude != null)
      .slice(0, MAX_MARKERS);

    if (filtered.length > 0 && showAmenitiesOnMap) {
      console.log('[AmenityMarkerLayer] Rendering', filtered.length, 'amenity markers');
    }

    return filtered;
  }, [amenities, showAmenitiesOnMap]);

  // Don't render if toggle is off
  if (!showAmenitiesOnMap) {
    console.log('[AmenityMarkerLayer] Toggle is OFF - not rendering markers');
    return null;
  }

  // Don't render if no markers
  if (markersToRender.length === 0) {
    console.log('[AmenityMarkerLayer] No markers to render - returning null');
    return null;
  }

  console.log('[AmenityMarkerLayer] Rendering', markersToRender.length, 'markers to map');

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={clusterRadius}
      showCoverageOnHover={false}
      iconCreateFunction={createAmenityClusterIcon}
      spiderfyOnMaxZoom={true}
      disableClusteringAtZoom={18}
      animate={true}
      animateAddingMarkers={true}
    >
      {markersToRender.map((amenity) => {
        const isSelected = selectedAmenityId === amenity.id; // Phase 2.32.1: Single selection
        const icon = createAmenityMarkerIcon(amenity.category, isSelected);

        return (
          <Marker
            key={`amenity-marker-${amenity.id}`}
            position={[amenity.latitude, amenity.longitude]}
            icon={icon}
            zIndexOffset={isSelected ? 2000 : 1000} // Selected amenities on top
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation(); // Prevent map click
                handleMarkerClick(amenity.id, isSelected);
              },
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -20]}
              opacity={0.95}
              permanent={false}
              sticky={false}
              className="amenity-marker-tooltip"
            >
              {amenity.name}
            </Tooltip>
            <Popup minWidth={200} maxWidth={280}>
              <AmenityMarkerPopup amenity={amenity} isSelected={isSelected} />
            </Popup>
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
};

export default AmenityMarkerLayer;
