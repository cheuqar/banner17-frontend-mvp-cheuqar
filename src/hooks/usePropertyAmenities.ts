/**
 * Custom hook for fetching and managing property amenities data
 * Implements lazy loading and caching for optimal performance
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchPropertyAmenities } from '../services/amenitiesService';
import type { 
  AmenitiesResponse, 
  PropertyAmenity,
  AmenitiesByCategory 
} from '../services/amenitiesService';

export interface UsePropertyAmenitiesOptions {
  categories?: string[];
  limitPerCategory?: number;
  radiusKm?: number;
}

export interface UsePropertyAmenitiesResult {
  amenities: PropertyAmenity[];
  amenitiesByCategory: AmenitiesByCategory;
  loading: boolean;
  error: string | null;
  totalFound: number;
  searchTime?: number;
  propertyCoordinates?: { latitude: number; longitude: number };
  searchRadius?: number;
  refetch: () => void;
  clearCache: () => void;
}

// Simple in-memory cache for amenities data
const amenitiesCache = new Map<string, { data: AmenitiesResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for property amenities with lazy loading and caching
 */
// Helper function to check if coordinates are available
const hasValidCoordinates = (property: any): boolean => {
  return property &&
         typeof property.latitude === 'number' &&
         typeof property.longitude === 'number' &&
         property.latitude !== null &&
         property.longitude !== null;
};

export const usePropertyAmenities = (
  propertyId: string | undefined,
  isActive: boolean,
  options: UsePropertyAmenitiesOptions = {},
  property?: any // Add property parameter to check coordinates
): UsePropertyAmenitiesResult => {
  // Memoize options to prevent infinite re-renders
  const memoizedOptions = useMemo(() => {
    const { categories, limitPerCategory = 10, radiusKm = 8 } = options;
    return { categories, limitPerCategory, radiusKm };
  }, [options.categories, options.limitPerCategory, options.radiusKm]);

  const [amenities, setAmenities] = useState<PropertyAmenity[]>([]);
  const [amenitiesByCategory, setAmenitiesByCategory] = useState<AmenitiesByCategory>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);
  const [searchTime, setSearchTime] = useState<number | undefined>(undefined);
  const [propertyCoordinates, setPropertyCoordinates] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [searchRadius, setSearchRadius] = useState<number | undefined>(undefined);

  // Keep track of the last successful fetch to avoid unnecessary re-fetches
  const lastFetchRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback((propId: string, opts: UsePropertyAmenitiesOptions) => {
    return `${propId}-${JSON.stringify(opts)}`;
  }, []);

  const fetchAmenities = useCallback(async (propId: string) => {
    // Check if property has valid coordinates before making API call
    if (!hasValidCoordinates(property)) {
      console.log('🚫 Skipping amenities fetch - property has no valid coordinates:', propId);
      setError('coordinates_unavailable');
      setAmenities([]);
      setAmenitiesByCategory({});
      setTotalFound(0);
      setSearchTime(undefined);
      setPropertyCoordinates(undefined);
      setSearchRadius(undefined);
      setLoading(false);

      // Mark as attempted to prevent retries
      const cacheKey = getCacheKey(propId, memoizedOptions);
      lastFetchRef.current = cacheKey;
      return;
    }

    const cacheKey = getCacheKey(propId, memoizedOptions);

    // Check cache first
    const cached = amenitiesCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('🎯 Using cached amenities data for property:', propId);
      const data = cached.data;
      
      // Convert to flat array for compatibility
      const flatAmenities: PropertyAmenity[] = Object.values(data.amenities_by_category).flat();
      
      setAmenities(flatAmenities);
      setAmenitiesByCategory(data.amenities_by_category);
      setTotalFound(data.total_count);
      setSearchTime(data.metadata?.search_time_ms);
      setPropertyCoordinates(data.property_coordinates);
      setSearchRadius(data.radius_km);
      setError(null);
      // ✅ Mark this cacheKey as fulfilled to prevent re-triggering the effect loop
      lastFetchRef.current = cacheKey;
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      console.log('🏗️ Fetching amenities for property:', propId, 'with options:', memoizedOptions);
      
      const data = await fetchPropertyAmenities(propId, memoizedOptions);
      
      // Cache the result
      amenitiesCache.set(cacheKey, { data, timestamp: Date.now() });
      
      // Convert to flat array for compatibility
      const flatAmenities: PropertyAmenity[] = Object.values(data.amenities_by_category).flat();
      
      setAmenities(flatAmenities);
      setAmenitiesByCategory(data.amenities_by_category);
      setTotalFound(data.total_count);
      setSearchTime(data.metadata?.search_time_ms);
      setPropertyCoordinates(data.property_coordinates);
      setSearchRadius(data.radius_km);
      
      lastFetchRef.current = cacheKey;
      
      console.log(`✅ Successfully loaded ${data.total_count} amenities in ${Object.keys(data.amenities_by_category).length} categories`);
    } catch (err) {
      // Only set error if the request wasn't aborted
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('❌ Error fetching amenities:', err);
        setError(err.message);
        setAmenities([]);
        setAmenitiesByCategory({});
        setTotalFound(0);
        setSearchTime(undefined);
        setPropertyCoordinates(undefined);
        setSearchRadius(undefined);

        // Mark this cacheKey as attempted to prevent infinite retries
        lastFetchRef.current = cacheKey;
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [memoizedOptions, getCacheKey, property]);

  const refetch = useCallback(() => {
    if (propertyId) {
      const cacheKey = getCacheKey(propertyId, memoizedOptions);
      amenitiesCache.delete(cacheKey); // Clear cache for this property
      lastFetchRef.current = null; // Reset retry prevention
      fetchAmenities(propertyId);
    }
  }, [propertyId, memoizedOptions, getCacheKey, fetchAmenities]);

  const clearCache = useCallback(() => {
    amenitiesCache.clear();
    console.log('🗑️ Cleared amenities cache');
  }, []);

  // Effect to fetch data when tab becomes active
  useEffect(() => {
    if (isActive && propertyId) {
      const cacheKey = getCacheKey(propertyId, options);
      
      // Only fetch if we haven't already fetched this exact combination
      if (lastFetchRef.current !== cacheKey) {
        fetchAmenities(propertyId);
      }
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isActive, propertyId, fetchAmenities, getCacheKey]);

  return {
    amenities,
    amenitiesByCategory,
    loading,
    error,
    totalFound,
    searchTime,
    propertyCoordinates,
    searchRadius,
    refetch,
    clearCache
  };
};

export default usePropertyAmenities;
