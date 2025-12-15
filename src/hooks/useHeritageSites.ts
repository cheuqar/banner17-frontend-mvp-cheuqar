import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Phase 2.55: Heritage Sites Overlay Hook
 *
 * Custom hook for fetching NSW heritage sites within map viewport bounds.
 * Implements debouncing to prevent excessive API calls during rapid pan/zoom.
 *
 * Heritage sites are color-coded by significance:
 * - Local: Blue (#3B82F6)
 * - State: Orange (#F97316)
 * - National: Red (#EF4444)
 * - World: Purple (#8B5CF6)
 */

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface HeritageItem {
  id: number;
  heritage_name: string | null;
  significance: string | null; // Local, State, National, World
  layer_class: string | null;  // Item-General, Conservation Area, etc.
  lga_name: string | null;
  boundary_coords: number[][][][] | null; // [[[[lng, lat], ...]]]
}

export interface HeritageResponse {
  items: HeritageItem[];
  total_count: number;
  viewport_bounds: {
    min_lng: number;
    min_lat: number;
    max_lng: number;
    max_lat: number;
  };
}

// Minimum zoom level required to fetch heritage sites
// At lower zoom levels, there would be too many sites to render efficiently
export const MIN_ZOOM_FOR_HERITAGE = 13;

// Color mapping for heritage significance levels
export const HERITAGE_COLORS: Record<string, string> = {
  'Local': '#3B82F6',    // Blue
  'State': '#F97316',    // Orange
  'National': '#EF4444', // Red
  'World': '#8B5CF6',    // Purple
};

interface UseHeritageSitesOptions {
  enabled: boolean;
  bounds: MapBounds | null;
  zoomLevel: number;
  significanceFilter?: string | null;
  maxResults?: number;
}

interface UseHeritageSitesResult {
  items: HeritageItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching heritage sites within map viewport bounds
 * Automatically debounces requests to prevent excessive API calls during map pan/zoom
 *
 * @param options.enabled - Whether to enable fetching (toggle state)
 * @param options.bounds - Current map viewport bounds
 * @param options.zoomLevel - Current map zoom level (must be >= MIN_ZOOM_FOR_HERITAGE)
 * @param options.significanceFilter - Optional filter by significance level
 * @param options.maxResults - Maximum sites to return (default 100, max 500)
 */
export const useHeritageSites = ({
  enabled,
  bounds,
  zoomLevel,
  significanceFilter = null,
  maxResults = 100,
}: UseHeritageSitesOptions): UseHeritageSitesResult => {
  // Check if zoom level is sufficient for heritage sites
  const isZoomSufficient = zoomLevel >= MIN_ZOOM_FOR_HERITAGE;
  const [items, setItems] = useState<HeritageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedBounds, setLastFetchedBounds] = useState<MapBounds | null>(null);

  // Track in-flight requests to prevent concurrent API calls
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestInFlightRef = useRef(false);

  // Cache key based on bounds (memoized to prevent unnecessary re-renders)
  const cacheKeyRef = useRef<Map<string, HeritageItem[]>>(new Map());

  // Generate cache key from bounds
  const getCacheKey = (b: MapBounds): string => {
    // Round to 3 decimal places for cache key (~100m precision)
    return `heritage:${b.north.toFixed(3)},${b.south.toFixed(3)},${b.east.toFixed(3)},${b.west.toFixed(3)}:${significanceFilter || 'all'}`;
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

  // Fetch heritage sites from API
  const fetchHeritageSites = useCallback(async () => {
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
      console.warn('[useHeritageSites] Invalid bounds:', bounds);
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(bounds);
    const cached = cacheKeyRef.current.get(cacheKey);
    if (cached) {
      console.log('[useHeritageSites] Using cached result:', cached.length, 'sites');
      setItems(cached);
      return;
    }

    // Cancel any previous in-flight request
    if (requestInFlightRef.current) {
      console.log('[useHeritageSites] Cancelling previous in-flight request');
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

      if (significanceFilter) {
        params.append('significance', significanceFilter);
      }

      console.log('[useHeritageSites] Fetching heritage sites with bounds:', {
        bounds,
        url: `${baseUrl}/api/v1/smart-search/heritage/bbox?${params}`,
      });

      const response = await fetch(
        `${baseUrl}/api/v1/smart-search/heritage/bbox?${params}`,
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

      const data: HeritageResponse = await response.json();

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response format: missing items array');
      }

      console.log('[useHeritageSites] Fetched successfully:', {
        count: data.items.length,
        total: data.total_count,
      });

      // Cache the result
      cacheKeyRef.current.set(cacheKey, data.items);

      // Limit cache size to prevent memory issues (keep last 10 viewports)
      if (cacheKeyRef.current.size > 10) {
        const firstKey = cacheKeyRef.current.keys().next().value;
        if (firstKey) {
          cacheKeyRef.current.delete(firstKey);
        }
      }

      setItems(data.items);
      setLastFetchedBounds(bounds);
    } catch (err) {
      // Skip error handling if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useHeritageSites] Request cancelled by user');
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useHeritageSites] Error:', errorMessage);
      setError(errorMessage);
      setItems([]);
    } finally {
      requestInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [bounds, enabled, isZoomSufficient, maxResults, significanceFilter]);

  // Track previous enabled state to detect toggle changes
  const prevEnabledRef = useRef(enabled);

  // Effect: debounced fetch on MEANINGFUL bounds change or toggle ON
  useEffect(() => {
    const wasJustEnabled = !prevEnabledRef.current && enabled;
    prevEnabledRef.current = enabled;

    if (!enabled || !bounds || !isZoomSufficient) {
      // Clear items when disabled or zoom is too low
      if ((!enabled || !isZoomSufficient) && items.length > 0) {
        setItems([]);
        console.log('[useHeritageSites] Cleared items - enabled:', enabled, 'zoomSufficient:', isZoomSufficient);
      }
      return;
    }

    // Fetch immediately when toggle is turned ON (don't wait for bounds change)
    if (wasJustEnabled) {
      console.log('[useHeritageSites] Toggle turned ON - fetching immediately');
      fetchHeritageSites();
      return;
    }

    // Check if bounds have meaningfully changed before fetching
    if (!boundsMeaningfullyChanged(bounds, lastFetchedBounds)) {
      console.log('[useHeritageSites] Bounds changed but not meaningfully - skipping fetch');
      return;
    }

    // Debounce fetch to prevent excessive API calls during rapid pan/zoom
    // 500ms debounce as per spec
    const timeoutId = setTimeout(() => {
      fetchHeritageSites();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [bounds, enabled, isZoomSufficient, boundsMeaningfullyChanged, lastFetchedBounds, fetchHeritageSites, items.length]);

  // Cleanup effect: Cancel any in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('[useHeritageSites] Cancelling request on component unmount');
        abortControllerRef.current.abort();
        requestInFlightRef.current = false;
      }
    };
  }, []);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      items,
      isLoading,
      error,
      refetch: fetchHeritageSites,
    }),
    [items, isLoading, error, fetchHeritageSites]
  );
};

export default useHeritageSites;
