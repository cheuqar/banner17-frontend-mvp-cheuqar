/**
 * School Marker Layer Component
 * Phase 2.10.7.4 - Map Layer: School Markers
 * Phase 2.23 - Enhanced with filter and external link buttons
 * =====================================================
 *
 * Renders school markers on the map with:
 * - Toggle visibility control
 * - Highlighting for selected schools (max 3)
 * - Marker popups with school info and action buttons
 * - Performance optimization (max 100 markers)
 * - Automatic updates on bounds change
 */

import React, { useMemo, useEffect, useCallback } from 'react';
import { Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Box, Typography, Chip } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../store';
import {
  selectShowMarkersOnMap,
  selectVisibleSchoolMarkers,
  selectSelectedSchools,
} from '../../../store/slices/smartSearch/schoolPanelSelectors';
import {
  selectShowSchoolsOnMap,
} from '../../../store/slices/smartSearchSlice';
import {
  selectSchool,
  deselectSchool,
} from '../../../store/slices/smartSearch/schoolPanelSlice';
import { SchoolMarkerPopup } from './SchoolMarkerPopup';
import L from 'leaflet';
import { createTeardropClusterIcon } from './PriceMarkerIcon';
import './SchoolMarkerLayer.css';

// Maximum number of markers to render for performance
// Phase 2.15.3: Increased from 100 → 2000 (Final step of progressive approach)
// Step 1: 100 → 1000 ✅
// Step 2: 1000 → 2000 ✅
const MAX_MARKERS = 2000;

// School amber color (Google Maps education style)
const SCHOOL_CLUSTER_COLOR = '#F9A825';

/**
 * Create school cluster icon - Teardrop style
 * Phase 2.45: Unified teardrop style matching property markers
 * Uses amber color to identify schools, number only (no icon/text label)
 * @param cluster - Leaflet MarkerCluster instance
 * @returns Leaflet DivIcon
 */
const createSchoolClusterIcon = (cluster: any): L.DivIcon => {
  const count = cluster.getChildCount();
  return createTeardropClusterIcon(count, SCHOOL_CLUSTER_COLOR, 'school-cluster');
};

/**
 * Calculate dynamic cluster radius based on zoom level
 * Phase 2.15.2 - Zoom-aware clustering
 * @param zoom - Current map zoom level
 * @returns Cluster radius in pixels
 */
const getSchoolClusterRadius = (zoom: number): number => {
  if (zoom <= 10) return 80;   // World/country view - larger clusters
  if (zoom <= 12) return 60;   // Regional view
  if (zoom <= 14) return 40;   // City/suburb view
  if (zoom <= 16) return 25;   // Neighborhood view
  return 15;                    // Street view - small clusters
};

/**
 * Create school marker icon - Google Maps style pin with school icon
 * Phase 2.24: Google Maps-style teardrop pin with graduation cap icon
 * @param selected - Whether this school is selected
 * @returns Leaflet DivIcon
 */
const createSchoolMarkerIcon = (selected: boolean): L.DivIcon => {
  // Google Maps style: Orange/amber for education, darker when selected
  // Normal: #F9A825 (amber/yellow like Google education markers)
  // Selected: #E65100 (deeper orange) with slightly larger size
  const pinColor = selected ? '#E65100' : '#F9A825';
  const iconColor = '#FFFFFF'; // White icon inside
  const width = selected ? 32 : 28;
  const height = selected ? 42 : 36;
  const shadowOpacity = selected ? 0.4 : 0.3;

  // Google Maps style teardrop pin with graduation cap icon inside
  return L.divIcon({
    className: 'school-marker-google-style',
    html: `
      <div style="
        position: relative;
        width: ${width}px;
        height: ${height}px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,${shadowOpacity}));
      ">
        <svg
          width="${width}"
          height="${height}"
          viewBox="0 0 28 36"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Teardrop pin shape (Google Maps style) -->
          <path
            d="M14 0C6.268 0 0 6.268 0 14c0 7.732 14 22 14 22s14-14.268 14-22C28 6.268 21.732 0 14 0z"
            fill="${pinColor}"
          />
          <!-- Inner circle for icon background -->
          <circle cx="14" cy="12" r="9" fill="${pinColor}" />
          <!-- Graduation cap icon (Google Maps education style) -->
          <g transform="translate(6, 5)" fill="${iconColor}">
            <!-- Cap top -->
            <polygon points="8,2 0,6 8,10 16,6" />
            <!-- Cap band and tassel -->
            <rect x="7" y="6" width="2" height="5" />
            <circle cx="8" cy="12" r="1.5" />
            <!-- Book/base -->
            <path d="M3 8v4c0 1 2.2 2 5 2s5-1 5-2V8L8 10.5 3 8z" />
          </g>
        </svg>
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height], // Anchor at bottom center (pin point)
    popupAnchor: [0, -height + 5],
  });
};


/**
 * School Marker Layer Component
 */
interface SchoolMarkerLayerProps {
  // Phase 2.12.2: Add support for schools from bbox endpoint
  schoolsInBounds?: any[];
}

export const SchoolMarkerLayer: React.FC<SchoolMarkerLayerProps> = ({
  schoolsInBounds = [],
}) => {
  // Phase 2.15.2: Get map instance for zoom-aware clustering
  const map = useMap();
  const zoom = map.getZoom();
  const clusterRadius = getSchoolClusterRadius(zoom);

  // Phase 2.16: Add dispatch for marker selection
  const dispatch = useAppDispatch();

  // Redux state - Phase 2.12.1: Use new toggle from smartSearchSlice
  const showMarkersLegacy = useAppSelector(selectShowMarkersOnMap);
  const showMarkers = useAppSelector(selectShowSchoolsOnMap);
  const visibleMarkers = useAppSelector(selectVisibleSchoolMarkers);
  const selectedSchools = useAppSelector(selectSelectedSchools);

  // Phase 2.12.1 FIX: Debug logging to track toggle state changes
  useEffect(() => {
    console.log('[SchoolMarkerLayer] Toggle state changed:', {
      showMarkersLegacy,
      showMarkers,
      visibleMarkersCount: visibleMarkers.length,
      selectedSchoolsCount: selectedSchools.length,
    });
  }, [showMarkers, visibleMarkers.length, selectedSchools.length, showMarkersLegacy]);

  // Memoize selected school IDs for performance
  const selectedSchoolIds = useMemo(
    () => new Set(selectedSchools.map((s) => s.school_id)),
    [selectedSchools]
  );

  /**
   * Handle marker click - select school and open popup
   * Phase 2.16: Unified selection behavior between map and list
   * Phase 2.46 FIX: Clicking a selected marker should NOT deselect it
   * - Click unselected marker → select it and open popup
   * - Click selected marker → just open popup (keep selection)
   * - Deselection happens via popup button or clicking different marker
   */
  const handleMarkerClick = useCallback((school: any, isSelected: boolean, markerRef: L.Marker | null) => {
    console.log('[SchoolMarkerLayer] Marker clicked:', {
      school_name: school.school_name,
      school_id: school.school_id,
      isSelected,
    });

    if (isSelected) {
      // Phase 2.46 FIX: Don't deselect when clicking selected marker
      // Just open the popup so user can interact with it
      console.log('[SchoolMarkerLayer] School already selected - opening popup only');
    } else {
      // Select school (auto-deselects previous due to MAX_SELECTED_SCHOOLS=1)
      console.log('[SchoolMarkerLayer] Selecting school via marker click');
      dispatch(selectSchool(school));
    }

    // Open popup
    if (markerRef) {
      setTimeout(() => {
        markerRef.openPopup();
      }, 50);
    }
  }, [dispatch]);

  // Memoize markers to render (max 100, valid coordinates only)
  // Phase 2.12.2: Support both selected schools and bbox schools
  // Phase 2.14 FIX: ALWAYS include selected schools, even if bbox is empty
  const markersToRender = useMemo(() => {
    // Phase 2.14 FIX: Start with bbox schools OR empty array
    let schoolsToDisplay = schoolsInBounds && schoolsInBounds.length > 0 ? [...schoolsInBounds] : [];

    console.log('[SchoolMarkerLayer] Initial schools to display:', {
      bboxSchoolsCount: schoolsInBounds?.length || 0,
      visibleMarkersCount: visibleMarkers.length,
      selectedSchoolsCount: selectedSchools.length,
    });

    // Phase 2.14 FIX: ALWAYS add selected schools that aren't already in bbox results
    selectedSchools.forEach(selectedSchool => {
      const alreadyInBbox = schoolsToDisplay.some(s => s.school_id === selectedSchool.school_id);
      if (!alreadyInBbox && selectedSchool.latitude != null && selectedSchool.longitude != null) {
        console.log('[SchoolMarkerLayer] Adding selected school to markers:', selectedSchool.school_name);
        schoolsToDisplay.push(selectedSchool);
      }
    });

    // Fallback to visibleMarkers if we still have nothing
    if (schoolsToDisplay.length === 0 && visibleMarkers.length > 0) {
      console.log('[SchoolMarkerLayer] Using visibleMarkers as fallback:', visibleMarkers.length);
      schoolsToDisplay = visibleMarkers;
    }

    const filtered = schoolsToDisplay
      .filter((school) => school.latitude != null && school.longitude != null)
      .slice(0, MAX_MARKERS);

    // Phase 2.12.1 FIX: Log when markers are filtered
    if (filtered.length > 0 && showMarkers) {
      console.log('[SchoolMarkerLayer] Rendering', filtered.length, 'school markers');
    }

    return filtered;
    // Phase 2.14 FIX: Add selectedSchools to dependencies
  }, [visibleMarkers, showMarkers, schoolsInBounds?.length, selectedSchools]);

  // Phase 2.12.1 FIX: Explicit debug logging before early returns
  if (!showMarkers) {
    console.log('[SchoolMarkerLayer] Toggle is OFF - not rendering markers');
    return null;
  }

  // Don't render if no markers
  if (markersToRender.length === 0) {
    console.log('[SchoolMarkerLayer] No markers to render - returning null');
    return null;
  }

  console.log('[SchoolMarkerLayer] Rendering', markersToRender.length, 'markers to map');

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={clusterRadius}
      showCoverageOnHover={false}
      iconCreateFunction={createSchoolClusterIcon}
      spiderfyOnMaxZoom={true}
      disableClusteringAtZoom={18}
      animate={true}
      animateAddingMarkers={true}
    >
      {markersToRender.map((school) => {
        const isSelected = selectedSchoolIds.has(school.school_id);
        const icon = createSchoolMarkerIcon(isSelected);

        return (
          <Marker
            key={`school-marker-${school.school_id}`}
            position={[school.latitude!, school.longitude!]}
            icon={icon}
            zIndexOffset={isSelected ? 2000 : 1000} // Selected schools on top
            eventHandlers={{
              click: (e) => {
                // Phase 2.16: Map marker selection
                e.originalEvent.stopPropagation(); // Prevent map click
                // Phase 2.46 FIX: Pass marker ref to open popup after selection
                const marker = e.target as L.Marker;
                handleMarkerClick(school, isSelected, marker);
              },
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -15]}
              opacity={0.95}
              permanent={false}
              sticky={false}
              className="school-marker-tooltip"
            >
              {school.school_name}
            </Tooltip>
            <Popup minWidth={280} maxWidth={350}>
              <SchoolMarkerPopup school={school} isSelected={isSelected} />
            </Popup>
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
};

export default SchoolMarkerLayer;
