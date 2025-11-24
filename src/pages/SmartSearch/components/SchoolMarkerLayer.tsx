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
import './SchoolMarkerLayer.css';

// Maximum number of markers to render for performance
// Phase 2.15.3: Increased from 100 → 2000 (Final step of progressive approach)
// Step 1: 100 → 1000 ✅
// Step 2: 1000 → 2000 ✅
const MAX_MARKERS = 2000;

/**
 * Create school cluster icon
 * Phase 2.21: Mono-chrome cluster matching property price marker style
 * @param cluster - Leaflet MarkerCluster instance
 * @returns Leaflet DivIcon
 */
const createSchoolClusterIcon = (cluster: any): L.DivIcon => {
  const count = cluster.getChildCount();

  // Phase 2.21: Unified mono-chrome cluster style
  // Background: 70% gray (#B3B3B3)
  // Border: 2px white
  // Text: Black, 13px, 600 weight
  const html = `
    <div class="school-cluster-marker">
      <div class="school-cluster-label">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#0b2d2c"
          xmlns="http://www.w3.org/2000/svg"
          style="flex-shrink: 0;"
        >
          <path d="M5 13.18v4c0 .55.45 1 1 1h1v4h6v-4h2v4h6v-4h1c.55 0 1-.45 1-1v-4l-8-5-8 5zM12 7.5c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5z"/>
        </svg>
        <span class="school-cluster-count">${count} schools</span>
      </div>
      <div class="school-cluster-pointer"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-school-cluster-marker',
    iconSize: [120, 50],
    iconAnchor: [60, 50],
    popupAnchor: [0, -50]
  });
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
 * Create school marker icon
 * Phase 2.21: Mono-chrome school icon (Material-UI School)
 * @param selected - Whether this school is selected
 * @returns Leaflet DivIcon
 */
const createSchoolMarkerIcon = (selected: boolean): L.DivIcon => {
  // Phase 2.21: Mono-chrome styling
  // Normal: 50% gray (#808080), Size 28px
  // Selected: Darker gray (#404040), Size 32px
  const iconColor = selected ? '#404040' : '#808080';
  const size = selected ? 32 : 28;

  return L.divIcon({
    className: 'school-marker-mono',
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
          <path d="M5 13.18v4c0 .55.45 1 1 1h1v4h6v-4h2v4h6v-4h1c.55 0 1-.45 1-1v-4l-8-5-8 5zM12 7.5c1.1 0 2-1.1 2-2.5s-.9-2.5-2-2.5-2 1.1-2 2.5.9 2.5 2 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
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
   * Handle marker click - select/deselect school
   * Phase 2.16: Unified selection behavior between map and list
   */
  const handleMarkerClick = useCallback((school: any, isSelected: boolean) => {
    console.log('[SchoolMarkerLayer] Marker clicked:', {
      school_name: school.school_name,
      school_id: school.school_id,
      isSelected,
    });

    if (isSelected) {
      // Deselect if already selected
      console.log('[SchoolMarkerLayer] Deselecting school via marker click');
      dispatch(deselectSchool(school.school_id));
    } else {
      // Select school (auto-deselects previous due to MAX_SELECTED_SCHOOLS=1)
      console.log('[SchoolMarkerLayer] Selecting school via marker click');
      dispatch(selectSchool(school));
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
                handleMarkerClick(school, isSelected);
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
            <Popup minWidth={200} maxWidth={280}>
              <SchoolMarkerPopup school={school} isSelected={isSelected} />
            </Popup>
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
};

export default SchoolMarkerLayer;
