import { union } from '@turf/union';
import { polygon, multiPolygon, featureCollection } from '@turf/helpers';
import type * as GeoJSON from 'geojson';

// Use GeoJSON.Feature instead of @turf/helpers Feature
type Feature<G extends GeoJSON.Geometry = GeoJSON.Geometry, P = GeoJSON.GeoJsonProperties> = GeoJSON.Feature<G, P>;

/**
 * Computes the union of multiple school catchment boundaries
 * @param catchments - Array of Polygon or MultiPolygon geometries
 * @returns Union result as Feature<MultiPolygon>, or null if computation fails
 *
 * Performance: <1s for 5 catchments, <2s for 10 catchments
 */
export const computeCatchmentUnion = (
  catchments: Array<GeoJSON.Polygon | GeoJSON.MultiPolygon>
): Feature<GeoJSON.MultiPolygon> | null => {
  console.log('[computeCatchmentUnion] Starting with', catchments.length, 'catchments');

  if (catchments.length === 0) {
    console.log('[computeCatchmentUnion] ERROR: Empty catchments array');
    return null;
  }

  if (catchments.length === 1) {
    // Single catchment - convert to MultiPolygon format and wrap in Feature
    const single = catchments[0];
    console.log('[computeCatchmentUnion] Single catchment:', {
      type: single.type,
      coordsLength: single.coordinates?.length
    });
    const geometry: GeoJSON.MultiPolygon = single.type === 'MultiPolygon'
      ? single
      : {
          type: 'MultiPolygon',
          coordinates: [single.coordinates]
        };

    // Return Feature object (not bare geometry)
    return {
      type: 'Feature',
      properties: {},
      geometry
    };
  }

  try {
    console.time('[CatchmentUnion] Computation');
    console.log('[computeCatchmentUnion] Converting catchments to Turf features');

    // Convert all to @turf features
    const features: Array<Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>> = catchments.map((c, i) => {
      console.log(`[computeCatchmentUnion] Processing catchment ${i + 1}:`, {
        type: c.type,
        coordsLength: c.coordinates?.length,
        firstRingLength: c.coordinates?.[0]?.length,
        sampleCoord: c.coordinates?.[0]?.[0]
      });

      try {
        if (c.type === 'Polygon') {
          const feature = polygon(c.coordinates, { id: i }) as Feature<GeoJSON.Polygon>;
          console.log(`[computeCatchmentUnion] Created Polygon feature for catchment ${i + 1}`);
          return feature;
        } else {
          const feature = multiPolygon(c.coordinates, { id: i }) as Feature<GeoJSON.MultiPolygon>;
          console.log(`[computeCatchmentUnion] Created MultiPolygon feature for catchment ${i + 1}`);
          return feature;
        }
      } catch (featureError: any) {
        console.error(`[computeCatchmentUnion] Failed to create Turf feature for catchment ${i + 1}:`, {
          error: featureError.message,
          catchmentType: c.type,
          coordsStructure: {
            length: c.coordinates?.length,
            firstRingLength: c.coordinates?.[0]?.length,
            firstPointLength: c.coordinates?.[0]?.[0]?.length,
            sampleCoord: c.coordinates?.[0]?.[0]
          }
        });
        throw featureError;
      }
    });

    console.log('[computeCatchmentUnion] All features created successfully, computing union...');

    // CRITICAL FIX: Turf v7+ union() expects FeatureCollection, not individual Features
    // Create FeatureCollection from all features and compute union in one call
    const fc = featureCollection(features);
    console.log('[computeCatchmentUnion] Created FeatureCollection with', features.length, 'features');

    const result = union(fc);
    if (!result) {
      throw new Error('Union computation returned null');
    }

    console.timeEnd('[CatchmentUnion] Computation');
    console.log(`[computeCatchmentUnion] SUCCESS: Computed union of ${catchments.length} catchments`, {
      resultType: result.geometry.type,
      coordsLength: result.geometry.coordinates?.length
    });

    // Return the full Feature object (Turf.js v7+ convention)
    return result as Feature<GeoJSON.MultiPolygon>;
  } catch (error: any) {
    console.error('[computeCatchmentUnion] ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      catchmentCount: catchments?.length
    });
    console.timeEnd('[CatchmentUnion] Computation');
    return null;
  }
};

/**
 * Validates if a value is a valid GeoJSON Polygon or MultiPolygon
 */
export const validateCatchment = (
  catchment: any
): catchment is GeoJSON.Polygon | GeoJSON.MultiPolygon => {
  if (!catchment || typeof catchment !== 'object') return false;
  if (catchment.type !== 'Polygon' && catchment.type !== 'MultiPolygon') return false;
  if (!Array.isArray(catchment.coordinates)) return false;
  return true;
};
