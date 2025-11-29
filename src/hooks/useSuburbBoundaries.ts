import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Phase 2.38: Suburb Boundaries Overlay Hook
 *
 * Custom hook for fetching NSW suburb boundaries within map viewport bounds.
 * Implements debouncing to prevent excessive API calls during rapid pan/zoom.
 *
 * @see handoff/features/smart-search/PHASE-2.38-SUBURB-BOUNDARIES-SPEC.md
 */

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface SuburbBoundary {
  suburb_name: string;
  boundary_coords: number[][][]; // WGS84 [[[lng, lat], ...]]
}

export interface SuburbBoundariesResponse {
  suburbs: SuburbBoundary[];
  total_count: number;
  viewport_bounds: {
    min_lng: number;
    min_lat: number;
    max_lng: number;
    max_lat: number;
  };
}

// Minimum zoom level required to fetch suburb boundaries
// At lower zoom levels, there would be too many suburbs to render efficiently
export const MIN_ZOOM_FOR_SUBURB_BOUNDARIES = 14;

interface UseSuburbBoundariesOptions {
  enabled: boolean;
  bounds: MapBounds | null;
  zoomLevel: number;
  maxResults?: number;
}

interface UseSuburbBoundariesResult {
  suburbs: SuburbBoundary[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching suburb boundaries within map viewport bounds
 * Automatically debounces requests to prevent excessive API calls during map pan/zoom
 *
 * @param options.enabled - Whether to enable fetching (toggle state)
 * @param options.bounds - Current map viewport bounds
 * @param options.zoomLevel - Current map zoom level (must be >= MIN_ZOOM_FOR_SUBURB_BOUNDARIES)
 * @param options.maxResults - Maximum suburbs to return (default 100, max 200)
 */
export const useSuburbBoundaries = ({
  enabled,
  bounds,
  zoomLevel,
  maxResults = 100,
}: UseSuburbBoundariesOptions): UseSuburbBoundariesResult => {
  // Check if zoom level is sufficient for suburb boundaries
  const isZoomSufficient = zoomLevel >= MIN_ZOOM_FOR_SUBURB_BOUNDARIES;
  const [suburbs, setSuburbs] = useState<SuburbBoundary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedBounds, setLastFetchedBounds] = useState<MapBounds | null>(null);

  // Track in-flight requests to prevent concurrent API calls
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestInFlightRef = useRef(false);

  // Cache key based on bounds (memoized to prevent unnecessary re-renders)
  const cacheKeyRef = useRef<Map<string, SuburbBoundary[]>>(new Map());

  // Generate cache key from bounds
  const getCacheKey = (b: MapBounds): string => {
    // Round to 3 decimal places for cache key (~100m precision)
    return `${b.north.toFixed(3)},${b.south.toFixed(3)},${b.east.toFixed(3)},${b.west.toFixed(3)}`;
  };

  // Helper function to check if bounds have meaningfully changed
  const boundsMeaningfullyChanged = useCallback(
    (newBounds: MapBounds | null, prevBounds: MapBounds | null): boolean => {
      if (!newBounds || !prevBounds) return newBounds !== prevBounds;

      const threshold = 0.001; // ~100 meters at the equator
      return (
        Math.abs(newBounds.north - prevBounds.north) > threshold ||
        Math.abs(newBounds.south - prevBounds.south) > threshold ||
        Math.abs(newBounds.east - prevBounds.east) > threshold ||
        Math.abs(newBounds.west - prevBounds.west) > threshold
      );
    },
    []
  );

  // Fetch suburb boundaries from API
  const fetchSuburbs = useCallback(async () => {
    if (!bounds || !enabled || !isZoomSufficient) {
      return;
    }

    // Validate bounds
    if (
      bounds.north === undefined ||
      bounds.south === undefined ||
      bounds.east === undefined ||
      bounds.west === undefined
    ) {
      console.warn('[useSuburbBoundaries] Invalid bounds:', bounds);
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(bounds);
    const cached = cacheKeyRef.current.get(cacheKey);
    if (cached) {
      console.log('[useSuburbBoundaries] Using cached result:', cached.length, 'suburbs');
      setSuburbs(cached);
      return;
    }

    // Cancel any previous in-flight request
    if (requestInFlightRef.current) {
      console.log('[useSuburbBoundaries] Cancelling previous in-flight request');
      abortControllerRef.current?.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    requestInFlightRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';

      // Convert bounds to API parameters (min/max lng/lat)
      const params = new URLSearchParams({
        min_lng: bounds.west.toString(),
        min_lat: bounds.south.toString(),
        max_lng: bounds.east.toString(),
        max_lat: bounds.north.toString(),
        max_results: maxResults.toString(),
      });

      console.log('[useSuburbBoundaries] Fetching suburbs with bounds:', {
        bounds,
        url: `${baseUrl}/api/v1/smart-search/suburbs/bbox?${params}`,
      });

      const response = await fetch(
        `${baseUrl}/api/v1/smart-search/suburbs/bbox?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: SuburbBoundariesResponse = await response.json();

      if (!data.suburbs || !Array.isArray(data.suburbs)) {
        throw new Error('Invalid response format: missing suburbs array');
      }

      console.log('[useSuburbBoundaries] Fetched successfully:', {
        count: data.suburbs.length,
        total: data.total_count,
      });

      // Cache the result
      cacheKeyRef.current.set(cacheKey, data.suburbs);

      // Limit cache size to prevent memory issues (keep last 10 viewports)
      if (cacheKeyRef.current.size > 10) {
        const firstKey = cacheKeyRef.current.keys().next().value;
        if (firstKey) {
          cacheKeyRef.current.delete(firstKey);
        }
      }

      setSuburbs(data.suburbs);
      setLastFetchedBounds(bounds);
    } catch (err) {
      // Skip error handling if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useSuburbBoundaries] Request cancelled by user');
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useSuburbBoundaries] Error:', errorMessage);
      setError(errorMessage);
      setSuburbs([]);
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [bounds, enabled, isZoomSufficient, maxResults]);

  // Track previous enabled state to detect toggle changes
  const prevEnabledRef = useRef(enabled);

  // Effect: debounced fetch on MEANINGFUL bounds change or toggle ON
  useEffect(() => {
    const wasJustEnabled = !prevEnabledRef.current && enabled;
    prevEnabledRef.current = enabled;

    if (!enabled || !bounds || !isZoomSufficient) {
      // Clear suburbs when disabled or zoom is too low
      if ((!enabled || !isZoomSufficient) && suburbs.length > 0) {
        setSuburbs([]);
        console.log('[useSuburbBoundaries] Cleared suburbs - enabled:', enabled, 'zoomSufficient:', isZoomSufficient);
      }
      return;
    }

    // Fetch immediately when toggle is turned ON (don't wait for bounds change)
    if (wasJustEnabled) {
      console.log('[useSuburbBoundaries] Toggle turned ON - fetching immediately');
      fetchSuburbs();
      return;
    }

    // Check if bounds have meaningfully changed before fetching
    if (!boundsMeaningfullyChanged(bounds, lastFetchedBounds)) {
      console.log('[useSuburbBoundaries] Bounds changed but not meaningfully - skipping fetch');
      return;
    }

    // Debounce fetch to prevent excessive API calls during rapid pan/zoom
    // 500ms debounce as per spec
    const timeoutId = setTimeout(() => {
      fetchSuburbs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [bounds, enabled, isZoomSufficient, boundsMeaningfullyChanged, lastFetchedBounds, fetchSuburbs, suburbs.length]);

  // Cleanup effect: Cancel any in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('[useSuburbBoundaries] Cancelling request on component unmount');
        abortControllerRef.current.abort();
        requestInFlightRef.current = false;
      }
    };
  }, []);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      suburbs,
      isLoading,
      error,
      refetch: fetchSuburbs,
    }),
    [suburbs, isLoading, error, fetchSuburbs]
  );
};

export default useSuburbBoundaries;
