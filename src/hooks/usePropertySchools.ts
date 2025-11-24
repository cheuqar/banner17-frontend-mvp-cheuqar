/**
 * Custom hook for managing property schools data
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { schoolsService } from '../services/schoolsService';
import type { 
  PropertySchoolsResponse, 
  PropertySchoolsGeoResponse,
  NearbySchool,
  SchoolCatchment
} from '../services/schoolsService';

export interface UsePropertySchoolsOptions {
  includeGeoData?: boolean;
  autoFetch?: boolean;
}

export interface UsePropertySchoolsReturn {
  // Data
  schoolsData: PropertySchoolsResponse | null;
  geoData: PropertySchoolsGeoResponse | null;
  
  // Processed data
  catchments: SchoolCatchment[];
  nearbySchoolsGrouped: {
    primary: {
      government: NearbySchool[];
      catholic: NearbySchool[];
      independent: NearbySchool[];
    };
    high: {
      government: NearbySchool[];
      catholic: NearbySchool[];
      independent: NearbySchool[];
    };
  };
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  refetch: () => Promise<void>;
  
  // Metadata
  totalSchools: number;
  calendarYear: number;
  disclaimer: string;
}

// Helper function to check if coordinates are available
const hasValidCoordinates = (property: any): boolean => {
  return property &&
         typeof property.latitude === 'number' &&
         typeof property.longitude === 'number' &&
         property.latitude !== null &&
         property.longitude !== null;
};

export const usePropertySchools = (
  propertyId: string | undefined,
  enabled: boolean = true,
  options: UsePropertySchoolsOptions = {},
  property?: any // Add property parameter to check coordinates
): UsePropertySchoolsReturn => {
  // Memoize options to prevent infinite re-renders
  const memoizedOptions = useMemo(() => {
    const { includeGeoData = false, autoFetch = true } = options;
    return { includeGeoData, autoFetch };
  }, [options.includeGeoData, options.autoFetch]);

  const { includeGeoData, autoFetch } = memoizedOptions;

  // State
  const [schoolsData, setSchoolsData] = useState<PropertySchoolsResponse | null>(null);
  const [geoData, setGeoData] = useState<PropertySchoolsGeoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep track of failed attempts to prevent infinite retries
  const lastAttemptRef = useRef<string | null>(null);

  // Fetch function
  const fetchSchoolsData = useCallback(async () => {
    if (!propertyId || !enabled) {
      return;
    }

    // Check if property has valid coordinates before making API call
    if (!hasValidCoordinates(property)) {
      console.log('🚫 Skipping schools fetch - property has no valid coordinates:', propertyId);
      setError('coordinates_unavailable');
      setSchoolsData(null);
      setGeoData(null);
      setLoading(false);

      // Mark as attempted to prevent retries
      const attemptKey = `${propertyId}-${includeGeoData}`;
      lastAttemptRef.current = attemptKey;
      return;
    }

    const attemptKey = `${propertyId}-${includeGeoData}`;

    // Prevent infinite retries for the same configuration
    if (lastAttemptRef.current === attemptKey) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🏫 [Schools] Fetching schools data for property: ${propertyId}`);
      
      // Fetch main schools data
      const schoolsResponse = await schoolsService.getPropertySchools(propertyId);
      setSchoolsData(schoolsResponse);

      // Fetch geo data if requested
      if (includeGeoData) {
        console.log(`🗺️ [Schools] Fetching geo data for property: ${propertyId}`);
        const geoResponse = await schoolsService.getPropertySchoolsGeo(propertyId);
        setGeoData(geoResponse);
      }

      console.log(`✅ [Schools] Successfully fetched schools data`, {
        catchments: schoolsResponse.catchments.length,
        nearbySchools: Object.values(schoolsResponse.nearby_schools.primary).flat().length +
                       Object.values(schoolsResponse.nearby_schools.high).flat().length,
        includeGeoData,
        geoPolygons: includeGeoData ? (geoData?.catchment_polygons.length || 0) : 'N/A'
      });

      // Mark as successfully attempted
      lastAttemptRef.current = attemptKey;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch schools data';
      console.error(`❌ [Schools] Error fetching schools data:`, errorMessage);
      setError(errorMessage);

      // Mark as attempted (even if failed) to prevent infinite retries
      lastAttemptRef.current = attemptKey;
    } finally {
      setLoading(false);
    }
  }, [propertyId, enabled, includeGeoData, property]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && enabled && propertyId) {
      fetchSchoolsData();
    }
  }, [fetchSchoolsData, autoFetch, enabled, propertyId]);

  // Reset data when property changes
  useEffect(() => {
    if (!propertyId) {
      setSchoolsData(null);
      setGeoData(null);
      setError(null);
    }
    // Reset retry prevention when property changes
    lastAttemptRef.current = null;
  }, [propertyId]);

  // Processed data
  const catchments = schoolsData?.catchments || [];
  const nearbySchoolsGrouped = schoolsData?.nearby_schools || {
    primary: { government: [], catholic: [], independent: [] },
    high: { government: [], catholic: [], independent: [] }
  };

  // Calculate total schools
  const totalSchools = catchments.length + 
    Object.values(nearbySchoolsGrouped.primary).flat().length +
    Object.values(nearbySchoolsGrouped.high).flat().length;

  // Metadata
  const calendarYear = schoolsData?.calendar_year || new Date().getFullYear();
  const disclaimer = schoolsData?.disclaimer || '';

  // Refetch function that resets retry prevention
  const refetch = useCallback(async () => {
    lastAttemptRef.current = null; // Reset retry prevention
    await fetchSchoolsData();
  }, [fetchSchoolsData]);

  return {
    // Data
    schoolsData,
    geoData,
    
    // Processed data
    catchments,
    nearbySchoolsGrouped,
    
    // State
    loading,
    error,
    
    // Actions
    refetch,
    
    // Metadata
    totalSchools,
    calendarYear,
    disclaimer,
  };
};
