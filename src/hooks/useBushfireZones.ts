import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Phase 2.55: Bushfire Prone Land Overlay Hook
 *
 * Custom hook for fetching NSW bushfire prone land zones within map viewport bounds.
 * Implements debouncing to prevent excessive API calls during rapid pan/zoom.
 *
 * Bushfire zones are color-coded by risk category (heat-based):
 * - Vegetation Category 1 (Highest Risk): Deep Red (#DC2626)
 * - Vegetation Category 2 (High Risk): Orange (#EA580C)
 * - Vegetation Category 3 (Moderate Risk): Yellow (#CA8A04)
 * - Vegetation Buffer (Buffer Zone): Light Orange (#FDBA74)
 */

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface BushfireZone {
  id: number;
  fid: number;
  category: string; // Vegetation Category 1/2/3, Vegetation Buffer
  area_sqm: number | null;
  boundary_coords: number[][][][] | null; // [[[[lng, lat], ...]]]
}

export interface BushfireResponse {
  zones: BushfireZone[];
  total_count: number;
  viewport_bounds: {
    min_lng: number;
    min_lat: number;
    max_lng: number;
    max_lat: number;
  };
}

// Minimum zoom level required to fetch bushfire zones
// At lower zoom levels, there would be too many zones to render efficiently
export const MIN_ZOOM_FOR_BUSHFIRE = 12;

// Color mapping for bushfire categories (heat-based palette)
export const BUSHFIRE_COLORS: Record<string, string> = {
  'Vegetation Category 1': '#DC2626', // Deep Red - Highest Risk
  'Vegetation Category 2': '#EA580C', // Orange - High Risk
  'Vegetation Category 3': '#CA8A04', // Yellow - Moderate Risk
  'Vegetation Buffer': '#FDBA74',     // Light Orange - Buffer Zone
};

// Fill opacity for bushfire zones
export const BUSHFIRE_FILL_OPACITY = 0.4;

interface UseBushfireZonesOptions {
  enabled: boolean;
  bounds: MapBounds | null;
  zoomLevel: number;
  categoryFilter?: string | null;
  maxResults?: number;
}

interface UseBushfireZonesResult {
  zones: BushfireZone[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching bushfire prone land zones within map viewport bounds
 * Automatically debounces requests to prevent excessive API calls during map pan/zoom
 *
 * @param options.enabled - Whether to enable fetching (toggle state)
 * @param options.bounds - Current map viewport bounds
 * @param options.zoomLevel - Current map zoom level (must be >= MIN_ZOOM_FOR_BUSHFIRE)
 * @param options.categoryFilter - Optional filter by category
 * @param options.maxResults - Maximum zones to return (default 200, max 1000)
 */
export const useBushfireZones = ({
  enabled,
  bounds,
  zoomLevel,
  categoryFilter = null,
  maxResults = 200,
}: UseBushfireZonesOptions): UseBushfireZonesResult => {
  // Check if zoom level is sufficient for bushfire zones
  const isZoomSufficient = zoomLevel >= MIN_ZOOM_FOR_BUSHFIRE;
  const [zones, setZones] = useState<BushfireZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedBounds, setLastFetchedBounds] = useState<MapBounds | null>(null);

  // Track in-flight requests to prevent concurrent API calls
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestInFlightRef = useRef(false);

  // Cache key based on bounds (memoized to prevent unnecessary re-renders)
  const cacheKeyRef = useRef<Map<string, BushfireZone[]>>(new Map());

  // Generate cache key from bounds
  const getCacheKey = (b: MapBounds): string => {
    // Round to 3 decimal places for cache key (~100m precision)
    return `bushfire:${b.north.toFixed(3)},${b.south.toFixed(3)},${b.east.toFixed(3)},${b.west.toFixed(3)}:${categoryFilter || 'all'}`;
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

  // Fetch bushfire zones from API
  const fetchBushfireZones = useCallback(async () => {
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
      console.warn('[useBushfireZones] Invalid bounds:', bounds);
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(bounds);
    const cached = cacheKeyRef.current.get(cacheKey);
    if (cached) {
      console.log('[useBushfireZones] Using cached result:', cached.length, 'zones');
      setZones(cached);
      return;
    }

    // Cancel any previous in-flight request
    if (requestInFlightRef.current) {
      console.log('[useBushfireZones] Cancelling previous in-flight request');
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

      if (categoryFilter) {
        params.append('category', categoryFilter);
      }

      console.log('[useBushfireZones] Fetching bushfire zones with bounds:', {
        bounds,
        url: `${baseUrl}/api/v1/smart-search/bushfire/bbox?${params}`,
      });

      const response = await fetch(
        `${baseUrl}/api/v1/smart-search/bushfire/bbox?${params}`,
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

      const data: BushfireResponse = await response.json();

      if (!data.zones || !Array.isArray(data.zones)) {
        throw new Error('Invalid response format: missing zones array');
      }

      console.log('[useBushfireZones] Fetched successfully:', {
        count: data.zones.length,
        total: data.total_count,
      });

      // Cache the result
      cacheKeyRef.current.set(cacheKey, data.zones);

      // Limit cache size to prevent memory issues (keep last 10 viewports)
      if (cacheKeyRef.current.size > 10) {
        const firstKey = cacheKeyRef.current.keys().next().value;
        if (firstKey) {
          cacheKeyRef.current.delete(firstKey);
        }
      }

      setZones(data.zones);
      setLastFetchedBounds(bounds);
    } catch (err) {
      // Skip error handling if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useBushfireZones] Request cancelled by user');
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useBushfireZones] Error:', errorMessage);
      setError(errorMessage);
      setZones([]);
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [bounds, enabled, isZoomSufficient, maxResults, categoryFilter]);

  // Track previous enabled state to detect toggle changes
  const prevEnabledRef = useRef(enabled);

  // Effect: debounced fetch on MEANINGFUL bounds change or toggle ON
  useEffect(() => {
    const wasJustEnabled = !prevEnabledRef.current && enabled;
    prevEnabledRef.current = enabled;

    if (!enabled || !bounds || !isZoomSufficient) {
      // Clear zones when disabled or zoom is too low
      if ((!enabled || !isZoomSufficient) && zones.length > 0) {
        setZones([]);
        console.log('[useBushfireZones] Cleared zones - enabled:', enabled, 'zoomSufficient:', isZoomSufficient);
      }
      return;
    }

    // Fetch immediately when toggle is turned ON (don't wait for bounds change)
    if (wasJustEnabled) {
      console.log('[useBushfireZones] Toggle turned ON - fetching immediately');
      fetchBushfireZones();
      return;
    }

    // Check if bounds have meaningfully changed before fetching
    if (!boundsMeaningfullyChanged(bounds, lastFetchedBounds)) {
      console.log('[useBushfireZones] Bounds changed but not meaningfully - skipping fetch');
      return;
    }

    // Debounce fetch to prevent excessive API calls during rapid pan/zoom
    // 500ms debounce as per spec
    const timeoutId = setTimeout(() => {
      fetchBushfireZones();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [bounds, enabled, isZoomSufficient, boundsMeaningfullyChanged, lastFetchedBounds, fetchBushfireZones, zones.length]);

  // Cleanup effect: Cancel any in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('[useBushfireZones] Cancelling request on component unmount');
        abortControllerRef.current.abort();
        requestInFlightRef.current = false;
      }
    };
  }, []);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      zones,
      isLoading,
      error,
      refetch: fetchBushfireZones,
    }),
    [zones, isLoading, error, fetchBushfireZones]
  );
};

export default useBushfireZones;
