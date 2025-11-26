/**
 * Catchment Layer Component
 * Phase 2.10.7.6 - Catchment Visualization & Nearby Area Filter
 * =====================================================
 *
 * Renders school catchment layers on the map with:
 * - Real catchment polygons for schools with catchment data
 * - 3km radius circles (blue, dashed) for schools without catchments
 * - Hover tooltips showing school name and catchment type
 * - Performance optimization with memoization
 * - Proper z-index layering and error handling
 *
 * Styling (Style4-V2 Theme):
 * - Desaturated grey-green (#8a9a8a) fill for catchments with 0.2-0.25 opacity
 * - Theme primary color (#0b2d2c) for catchment borders
 * - Blue (#4A90E2) for 3km circles with 0.1 opacity
 * - Dashed pattern for 3km circles, solid for catchments
 */

import React, { useMemo } from 'react';
import { Circle, Polygon, Popup, FeatureGroup } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import { useAppSelector } from '../../../store';
import { selectSelectedSchools } from '../../../store/slices/smartSearch/schoolPanelSelectors';
import { selectShowCatchmentRadius } from '../../../store/slices/smartSearchSlice';
import type { School } from '../../../types/smartSearch';

// Theme primary color for consistent styling
const THEME_PRIMARY = '#0b2d2c';

// Constants for styling
const CATCHMENT_STYLE = {
  color: THEME_PRIMARY,    // Primary theme color for border
  weight: 2,
  opacity: 0.8,
  fillColor: '#8a9a8a',    // Desaturated grey-green for fill
  fillOpacity: 0.25,
  dashArray: undefined     // Solid line
};

const NEARBY_CIRCLE_STYLE = {
  color: '#4A90E2',        // Blue for 3km circles
  weight: 2,
  opacity: 0.6,
  fillOpacity: 0.1,
  dashArray: '5, 5'        // Dashed pattern
};

// Fallback circle style for invalid catchment data
const FALLBACK_CIRCLE_STYLE = {
  color: '#4A90E2',        // Blue for fallback circles
  weight: 2,
  opacity: 0.4,            // Lighter to indicate fallback
  fillOpacity: 0.08,
  dashArray: '10, 5'       // Different dash pattern to indicate fallback
};

const NEARBY_RADIUS_METERS = 3000; // 3km radius

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
 * All catchments use theme primary color for border with desaturated grey-green fills
 */
const getCatchmentStyle = (schoolType: string) => {
  // All school types use the same desaturated grey-green with theme primary border
  // This creates a cohesive, professional look that doesn't distract from property markers
  return {
    fillColor: '#8a9a8a',    // Desaturated grey-green for all catchments
    fillOpacity: 0.2,
    color: THEME_PRIMARY,    // Theme primary color for border
    weight: 2,
    opacity: 0.8
  };
};

/**
 * Catchment Popup Component
 * Style4-V2 design system (black/white/gray palette)
 */
interface CatchmentPopupProps {
  school: School;
  type: 'polygon' | 'circle';
  note?: string;  // Optional note for special cases (e.g., invalid catchment data)
}

const CatchmentPopup: React.FC<CatchmentPopupProps> = ({ school, type, note }) => {
  const typeLabel = type === 'polygon' ? 'School Catchment (Official)' : 'Nearby Area (3km Radius)';

  return (
    <Box
      sx={{
        minWidth: 200,
        maxWidth: 280,
        p: 1.5,
        fontFamily: '"Amplitude", "Segoe UI", Roboto, system-ui, sans-serif',
      }}
    >
      {/* School Name - Style4-V2 heading */}
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
          color: type === 'polygon' ? '#4CAF50' : '#4A90E2',
          fontWeight: 500,
          mb: 1,
        }}
      >
        {typeLabel}
      </Typography>

      {/* Optional Note (for fallback or special cases) */}
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
 * Catchment Layer Component
 * Renders real catchments as polygons and generates 3km circles for schools without catchments
 * Phase 2.13 FIX: Respects showCatchmentRadius toggle for visibility control
 */
export const CatchmentLayer: React.FC = () => {
  // Get selected schools from Redux
  const selectedSchools = useAppSelector(selectSelectedSchools);

  // Memoize processed catchments for performance
  const processedCatchments = useMemo(() => {
    return selectedSchools
      .filter((school) => {
        // Validate school has required coordinates
        return school.latitude != null && school.longitude != null;
      })
      .map((school) => {
        // Determine if school has valid catchment boundary
        // FIX: Phase 2.14 - catchment_area is a string ID (e.g., "NSW-CATCH-1280"), not a boolean
        const hasCatchment = (school.catchment_area != null && school.catchment_area !== '') ||
                            school.catchment_boundary != null;

        return {
          school,
          hasCatchment,
          catchmentCoords: hasCatchment
            ? convertCatchmentToLeafletFormat(school.catchment_boundary)
            : null,
        };
      });
  }, [selectedSchools]);

  // FIX: Phase 2.14 - Always show catchment visualization when schools are selected
  // The toggle only controls property FILTERING, not polygon visibility
  if (processedCatchments.length === 0) {
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
        // Show lighter blue dashed circle as fallback
        if (hasCatchment && !catchmentCoords) {
          console.warn('[CatchmentLayer] Showing fallback circle for school with invalid catchment:', school.school_name);
          return (
            <Circle
              key={`catchment-circle-fallback-${school.school_id}`}
              center={[school.latitude!, school.longitude!]}
              radius={NEARBY_RADIUS_METERS}
              pathOptions={FALLBACK_CIRCLE_STYLE}
            >
              <Popup minWidth={200} maxWidth={280}>
                <CatchmentPopup
                  school={school}
                  type="circle"
                  note="Catchment data unavailable - showing estimated area"
                />
              </Popup>
            </Circle>
          );
        }

        // CASE 3: School has no catchment data - show standard 3km radius circle
        return (
          <Circle
            key={`catchment-circle-${school.school_id}`}
            center={[school.latitude!, school.longitude!]}
            radius={NEARBY_RADIUS_METERS}
            pathOptions={NEARBY_CIRCLE_STYLE}
          >
            <Popup minWidth={200} maxWidth={280}>
              <CatchmentPopup school={school} type="circle" />
            </Popup>
          </Circle>
        );
      })}
    </FeatureGroup>
  );
};

export default CatchmentLayer;
