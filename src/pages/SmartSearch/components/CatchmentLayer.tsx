/**
 * Catchment Layer Component
 * Phase 2.10.7.6 - Catchment Visualization & Nearby Area Filter
 * =====================================================
 *
 * Renders school catchment layers on the map with:
 * - Real catchment polygons for schools with catchment data
 * - Adjustable radius circles for schools without catchments (1-8km, 0.5km steps)
 * - Hover tooltips showing school name and catchment type
 * - Performance optimization with memoization
 * - Proper z-index layering and error handling
 *
 * Styling (Smart Search Theme-A):
 * - Accent color (#f0492e) for all catchment/circle borders (100% opacity) and fill (15% opacity)
 * - Dashed pattern for radius circles, solid for catchment polygons
 */

import React, { useMemo } from 'react';
import { Circle, Polygon, Popup, FeatureGroup } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import { useAppSelector } from '../../../store';
import { selectSelectedSchools } from '../../../store/slices/smartSearch/schoolPanelSelectors';
import { selectShowCatchmentRadius, selectSchoolSearchRadius } from '../../../store/slices/smartSearchSlice';
import type { School } from '../../../types/smartSearch';

// Catchment accent color (Theme-A linkButtonActive)
const CATCHMENT_ACCENT = '#f0492e';

// Constants for styling
const CATCHMENT_STYLE = {
  color: CATCHMENT_ACCENT,    // Accent color for border
  weight: 2,
  opacity: 1,                 // 100% opacity for border
  fillColor: CATCHMENT_ACCENT,    // Same accent color for fill
  fillOpacity: 0.15,          // 15% opacity for fill
  dashArray: undefined        // Solid line
};

const NEARBY_CIRCLE_STYLE = {
  color: CATCHMENT_ACCENT,    // Accent color for 3km circles
  weight: 2,
  opacity: 1,                 // 100% opacity for border
  fillColor: CATCHMENT_ACCENT,
  fillOpacity: 0.15,          // 15% opacity for fill
  dashArray: '5, 5'           // Dashed pattern to distinguish from catchment polygons
};

// Fallback circle style for invalid catchment data
const FALLBACK_CIRCLE_STYLE = {
  color: CATCHMENT_ACCENT,    // Accent color for fallback circles
  weight: 2,
  opacity: 0.6,               // Slightly lighter to indicate fallback
  fillColor: CATCHMENT_ACCENT,
  fillOpacity: 0.1,           // Lighter fill to indicate fallback
  dashArray: '10, 5'          // Different dash pattern to indicate fallback
};

// Default and range for adjustable radius (in km)
const DEFAULT_RADIUS_KM = 3;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 8;
const RADIUS_STEP_KM = 0.5;

// Slider marks for visual guidance
const RADIUS_MARKS = [
  { value: 1, label: '1km' },
  { value: 3, label: '3km' },
  { value: 5, label: '5km' },
  { value: 8, label: '8km' },
];

/**
 * Convert catchment coordinates to Leaflet format
 * Handles nested array structure: [[[[lng, lat], ...]]] -> [[[lat, lng], ...]]
 *
 * Enhanced error logging to help debug invalid catchment data
 */
const convertCatchmentToLeafletFormat = (catchment: any): [number, number][][] | null => {
  try {
    console.log('[CatchmentLayer] Converting catchment data:', {
      isArray: Array.isArray(catchment),
      length: Array.isArray(catchment) ? catchment.length : 'N/A',
      firstLevel: Array.isArray(catchment) ? typeof catchment[0] : 'N/A',
      secondLevel: Array.isArray(catchment) && Array.isArray(catchment[0]) ? typeof catchment[0][0] : 'N/A',
      thirdLevel: Array.isArray(catchment) && Array.isArray(catchment[0]) && Array.isArray(catchment[0][0]) ? typeof catchment[0][0][0] : 'N/A',
    });

    if (!catchment) {
      console.warn('[CatchmentLayer] No catchment data provided');
      return null;
    }

    if (!Array.isArray(catchment) || catchment.length === 0) {
      console.warn('[CatchmentLayer] Catchment is not a valid array');
      return null;
    }

    // Handle [[[[lng, lat], ...]]] format from database
    // Convert to Leaflet format: [[[lat, lng], ...]]
    let coords = catchment;
    let unwrapCount = 0;

    // Remove outer array wrappers until we reach coordinate pairs array
    // Stop when coords[0] is a coordinate pair [lng, lat] (first element is a number)
    while (Array.isArray(coords[0]) && coords[0].length > 0 && typeof coords[0][0] !== 'number') {
      console.log(`[CatchmentLayer] Unwrapping level ${unwrapCount}, coords[0][0] type: ${typeof coords[0][0]}`);
      coords = coords[0];
      unwrapCount++;
      if (unwrapCount > 5) {
        console.error('[CatchmentLayer] Too many nesting levels, possible infinite loop');
        return null;
      }
    }

    console.log(`[CatchmentLayer] After ${unwrapCount} unwraps, coords length: ${coords.length}, first coord:`, coords[0]);

    // Validate we have minimum required coordinates
    if (!Array.isArray(coords) || coords.length < 3) {
      console.warn('[CatchmentLayer] Invalid catchment coordinates (need minimum 3 points)', {
        coordCount: coords?.length,
        firstPoint: coords?.[0],
      });
      return null;
    }

    // Validate coordinate format before conversion
    const convertedCoords = coords.map(([lng, lat]: [number, number]) => {
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error(`Invalid coordinate format: [${lng}, ${lat}]`);
      }
      return [lat, lng] as [number, number];
    });

    console.log(`[CatchmentLayer] Successfully converted ${convertedCoords.length} coordinates`);
    return [convertedCoords];
  } catch (error) {
    console.error('[CatchmentLayer] Error converting catchment coordinates:', {
      error: error instanceof Error ? error.message : String(error),
      catchmentSample: Array.isArray(catchment) ? catchment.slice(0, 2) : 'not an array',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

/**
 * Get catchment style based on school type
 * All catchments use accent color with 100% border opacity and 15% fill opacity
 */
const getCatchmentStyle = (schoolType: string) => {
  // All school types use the same accent color styling
  // This creates a cohesive, professional look that doesn't distract from property markers
  return {
    fillColor: CATCHMENT_ACCENT,    // Accent color for all catchments
    fillOpacity: 0.15,              // 15% opacity for fill
    color: CATCHMENT_ACCENT,        // Accent color for border
    weight: 2,
    opacity: 1                      // 100% opacity for border
  };
};

/**
 * Catchment Popup Component (simplified - slider is in SchoolMarkerPopup)
 * Style4-V2 design system (black/white/gray palette)
 */
interface CatchmentPopupProps {
  school: School;
  type: 'polygon' | 'circle';
  note?: string;
  radiusKm?: number;
}

const CatchmentPopup: React.FC<CatchmentPopupProps> = ({
  school,
  type,
  note,
  radiusKm = DEFAULT_RADIUS_KM,
}) => {
  const typeLabel = type === 'polygon'
    ? 'School Catchment (Official)'
    : `Nearby Area (${radiusKm}km Radius)`;

  return (
    <Box
      sx={{
        minWidth: 200,
        maxWidth: 280,
        p: 1.5,
        fontFamily: '"Amplitude", "Segoe UI", Roboto, system-ui, sans-serif',
      }}
    >
      {/* School Name */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: 1.4,
          color: '#0b2d2c',
          mb: 0.5,
        }}
      >
        {school.school_name}
      </Typography>

      {/* Catchment Type Label */}
      <Typography
        variant="body2"
        sx={{
          fontSize: '12px',
          color: type === 'polygon' ? '#4CAF50' : CATCHMENT_ACCENT,
          fontWeight: 500,
          mb: 1,
        }}
      >
        {typeLabel}
      </Typography>

      {/* Optional Note */}
      {note && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            color: '#FF9800',
            display: 'block',
            mb: 1,
            fontStyle: 'italic',
          }}
        >
          {note}
        </Typography>
      )}

      {/* Hint for radius adjustment */}
      {type === 'circle' && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '10px',
            color: '#999999',
            display: 'block',
            fontStyle: 'italic',
          }}
        >
          Click school marker to adjust radius
        </Typography>
      )}

      {/* School Type */}
      {school.school_type && (
        <Typography
          variant="body2"
          sx={{
            fontSize: '12px',
            color: '#666666',
            mb: 0.5,
          }}
        >
          {school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1)} School
        </Typography>
      )}

      {/* Address */}
      {school.address && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            color: '#999999',
            display: 'block',
          }}
        >
          {school.address}
          {school.suburb && `, ${school.suburb}`}
          {school.postcode && ` ${school.postcode}`}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Individual School Circle Component
 * Uses Redux searchRadius for consistent sizing across map and popup
 */
interface SchoolCircleProps {
  school: School;
  isFallback?: boolean;
  radiusKm: number;
}

const SchoolCircle: React.FC<SchoolCircleProps> = ({ school, isFallback = false, radiusKm }) => {
  // Convert km to meters for Leaflet
  const radiusMeters = radiusKm * 1000;

  // Phase 2.46 FIX: Include radiusKm in key to force Circle re-render when radius changes
  // Leaflet Circle component doesn't automatically update radius prop
  return (
    <Circle
      key={`catchment-circle-${isFallback ? 'fallback-' : ''}${school.school_id}-${radiusKm}`}
      center={[school.latitude!, school.longitude!]}
      radius={radiusMeters}
      pathOptions={isFallback ? FALLBACK_CIRCLE_STYLE : NEARBY_CIRCLE_STYLE}
    >
      <Popup minWidth={200} maxWidth={280}>
        <CatchmentPopup
          school={school}
          type="circle"
          radiusKm={radiusKm}
          note={isFallback ? 'Catchment data unavailable - showing estimated area' : undefined}
        />
      </Popup>
    </Circle>
  );
};

/**
 * Catchment Layer Component
 * Renders real catchments as polygons and adjustable radius circles for schools without catchments
 * Phase 2.13 FIX: Respects showCatchmentRadius toggle for visibility control
 */
export const CatchmentLayer: React.FC = () => {
  // Get selected schools and search radius from Redux
  const selectedSchools = useAppSelector(selectSelectedSchools);
  const searchRadius = useAppSelector(selectSchoolSearchRadius) || DEFAULT_RADIUS_KM;

  // Phase 2.46: Debug logging for radius changes
  console.log('[CatchmentLayer] Rendering with:', {
    searchRadius,
    selectedSchoolsCount: selectedSchools.length,
    selectedSchools: selectedSchools.map(s => ({
      name: s.school_name,
      id: s.school_id,
      lat: s.latitude,
      lng: s.longitude,
      catchment_area: s.catchment_area,
      has_catchment_boundary: !!s.catchment_boundary
    }))
  });

  // Memoize processed catchments for performance
  const processedCatchments = useMemo(() => {
    const result = selectedSchools
      .filter((school) => {
        // Validate school has required coordinates
        return school.latitude != null && school.longitude != null;
      })
      .map((school) => {
        // Determine if school has valid catchment boundary
        // Phase 2.46 FIX: Only consider a school as having catchment if it has ACTUAL boundary data
        // catchment_area is just a string ID (e.g., "NSW-CATCH-1280") - doesn't mean boundaries exist
        // We need actual catchment_boundary array with coordinates to render a polygon
        const hasCatchmentBoundary = school.catchment_boundary != null &&
                                     Array.isArray(school.catchment_boundary) &&
                                     school.catchment_boundary.length > 0;
        const hasCatchment = hasCatchmentBoundary;

        const catchmentCoords = hasCatchment
          ? convertCatchmentToLeafletFormat(school.catchment_boundary)
          : null;

        console.log('[CatchmentLayer] Processing school:', {
          name: school.school_name,
          hasCatchment,
          hasCatchmentCoords: !!catchmentCoords,
          willRenderCircle: !hasCatchment || (hasCatchment && !catchmentCoords)
        });

        return {
          school,
          hasCatchment,
          catchmentCoords,
        };
      });

    console.log('[CatchmentLayer] Processed catchments count:', result.length);
    return result;
  }, [selectedSchools]);

  // FIX: Phase 2.14 - Always show catchment visualization when schools are selected
  // The toggle only controls property FILTERING, not polygon visibility
  if (processedCatchments.length === 0) {
    console.log('[CatchmentLayer] No processed catchments - returning null');
    return null;
  }

  return (
    <FeatureGroup>
      {processedCatchments.map(({ school, hasCatchment, catchmentCoords }) => {
        // CASE 1: School has real catchment polygon with valid coordinates
        if (hasCatchment && catchmentCoords && catchmentCoords[0].length > 0) {
          return (
            <Polygon
              key={`catchment-polygon-${school.school_id}`}
              positions={catchmentCoords[0]}
              pathOptions={CATCHMENT_STYLE}
            >
              <Popup minWidth={200} maxWidth={280}>
                <CatchmentPopup school={school} type="polygon" />
              </Popup>
            </Polygon>
          );
        }

        // CASE 2: School claims catchment but coordinates are invalid/null
        // Show adjustable radius circle as fallback
        if (hasCatchment && !catchmentCoords) {
          console.warn('[CatchmentLayer] Showing fallback circle for school with invalid catchment:', school.school_name);
          return (
            <SchoolCircle
              key={`catchment-circle-fallback-${school.school_id}-${searchRadius}`}
              school={school}
              isFallback
              radiusKm={searchRadius}
            />
          );
        }

        // CASE 3: School has no catchment data - show adjustable radius circle
        return (
          <SchoolCircle
            key={`catchment-circle-${school.school_id}-${searchRadius}`}
            school={school}
            radiusKm={searchRadius}
          />
        );
      })}
    </FeatureGroup>
  );
};

export default CatchmentLayer;
