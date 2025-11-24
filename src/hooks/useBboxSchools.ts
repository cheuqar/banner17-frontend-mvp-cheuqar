import { useState, useEffect, useCallback } from 'react';
import * as React from 'react';
import { useAppDispatch } from '../store';
import {
  setSchoolsInBounds,
  setBboxLoading,
  setBboxError,
  setLastBounds,
} from '../store/slices/smartSearch/schoolBboxSlice';
import type { School } from '../types/smartSearch';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Custom hook for fetching schools within map bounds
 * Automatically debounces requests to prevent excessive API calls
 */
export const useBboxSchools = (bounds: MapBounds | null, enabled: boolean = false) => {
  const dispatch = useAppDispatch();
  const [schools, setLocalSchools] = useState<School[]>([]);
  const [loading, setLocalLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  const [lastFetchedBounds, setLastFetchedBounds] = useState<MapBounds | null>(null);

  // Track in-flight requests to prevent concurrent API calls
  // Uses useRef to prevent re-renders and ensure single source of truth
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const requestInFlightRef = React.useRef(false);

  // Helper function to check if bounds have meaningfully changed
  // Uses a threshold to avoid unnecessary fetches from floating-point coordinate changes
  const boundsMeaningfullyChanged = (newBounds: MapBounds | null, prevBounds: MapBounds | null): boolean => {
    if (!newBounds || !prevBounds) return newBounds !== prevBounds;

    const threshold = 0.001; // ~100 meters at the equator
    return (
      Math.abs(newBounds.north - prevBounds.north) > threshold ||
      Math.abs(newBounds.south - prevBounds.south) > threshold ||
      Math.abs(newBounds.east - prevBounds.east) > threshold ||
      Math.abs(newBounds.west - prevBounds.west) > threshold
    );
  };

  // Fetch schools from bbox endpoint
  const fetchSchools = useCallback(async () => {
    if (!bounds || !enabled) {
      return;
    }

    // Validate bounds
    if (!bounds.north || !bounds.south || !bounds.east || !bounds.west) {
      console.warn('[useBboxSchools] Invalid bounds:', bounds);
      return;
    }

    // CRITICAL: Prevent concurrent requests
    // If a request is already in-flight, cancel it and start a new one
    // This ensures only the most recent request completes
    if (requestInFlightRef.current) {
      console.log('[useBboxSchools] Cancelling previous in-flight request');
      abortControllerRef.current?.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    requestInFlightRef.current = true;

    dispatch(setBboxLoading(true));
    dispatch(setBboxError(null));

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';

      const params = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        limit: '100', // Max schools to return
      });

      console.log('[useBboxSchools] Fetching schools with bounds:', {
        bounds,
        url: `${baseUrl}/api/v1/smart-search/schools/within-bounds?${params}`,
      });

      const response = await fetch(
        `${baseUrl}/api/v1/smart-search/schools/within-bounds?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
        }
      );

      // Handle aborted requests gracefully (don't log as error)
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.schools || !Array.isArray(data.schools)) {
        throw new Error('Invalid response format: missing schools array');
      }

      console.log('[useBboxSchools] Fetched successfully:', {
        count: data.schools.length,
        total: data.total_count,
      });

      setLocalSchools(data.schools);
      dispatch(setSchoolsInBounds(data.schools));
      dispatch(setLastBounds(bounds));

    } catch (err) {
      // Skip error handling if request was aborted (user cancelled it)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useBboxSchools] Request cancelled by user');
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useBboxSchools] Error:', errorMessage);
      setLocalError(errorMessage);
      dispatch(setBboxError(errorMessage));
      setLocalSchools([]);
    } finally {
      requestInFlightRef.current = false;
      dispatch(setBboxLoading(false));
      setLocalLoading(false);
    }
    // CRITICAL: Do NOT include 'dispatch' in dependencies - Redux dispatch is stable
    // and doesn't change. Including it causes circular dependency with useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds, enabled]);

  // Effect: debounced fetch on MEANINGFUL bounds change
  useEffect(() => {
    if (!enabled || !bounds) {
      return;
    }

    // CRITICAL FIX: Check if bounds have meaningfully changed before fetching
    // This prevents infinite loops caused by floating-point coordinate drifts
    if (!boundsMeaningfullyChanged(bounds, lastFetchedBounds)) {
      console.log('[useBboxSchools] Bounds changed but not meaningfully - skipping fetch');
      return;
    }

    // Debounce fetch to prevent excessive API calls during rapid pan/zoom
    // Increased to 800ms for better debouncing during aggressive pan/zoom interactions
    const timeoutId = setTimeout(() => {
      fetchSchools();
      setLastFetchedBounds(bounds);
    }, 800); // 800ms debounce (increased from 500ms for better performance)

    return () => clearTimeout(timeoutId);
  }, [bounds, enabled, lastFetchedBounds]);

  // Cleanup effect: Cancel any in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('[useBboxSchools] Cancelling request on component unmount');
        abortControllerRef.current.abort();
        requestInFlightRef.current = false;
      }
    };
  }, []);

  return {
    schools,
    loading,
    error,
    refetch: fetchSchools,
  };
};
