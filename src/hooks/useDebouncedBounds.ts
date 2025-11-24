/**
 * useDebouncedBounds Hook
 * Phase 2.32.7 - Robust Map Auto-Refresh
 *
 * Debounces map bounds changes to prevent excessive API calls.
 * Follows schools pattern (useBboxSchools) with 800ms debounce.
 *
 * Features:
 * - 800ms debounce delay (matches schools pattern)
 * - 0.001° threshold to prevent false positives from micro-movements
 * - Returns null if bounds haven't meaningfully changed
 */

import { useEffect, useState, useRef } from 'react';
import type { BBoxBounds } from '../store/slices/smartSearchSlice';

const DEBOUNCE_DELAY = 800; // ms - matches schools pattern
const BOUNDS_THRESHOLD = 0.001; // degrees - prevent false positives

/**
 * Custom hook to debounce map bounds changes
 *
 * @param bounds - Current map bounds from Redux
 * @param delay - Optional custom debounce delay (default 800ms)
 * @returns Debounced bounds (or null if no meaningful change)
 */
export function useDebouncedBounds(
  bounds: BBoxBounds | null,
  delay: number = DEBOUNCE_DELAY
): BBoxBounds | null {
  const [debouncedBounds, setDebouncedBounds] = useState<BBoxBounds | null>(bounds);
  const previousBoundsRef = useRef<BBoxBounds | null>(null);

  useEffect(() => {
    // No bounds to debounce
    if (!bounds) {
      setDebouncedBounds(null);
      return;
    }

    // Check if bounds meaningfully changed (>0.001° threshold)
    const boundsChanged = !previousBoundsRef.current ||
      Math.abs(bounds.north - previousBoundsRef.current.north) > BOUNDS_THRESHOLD ||
      Math.abs(bounds.south - previousBoundsRef.current.south) > BOUNDS_THRESHOLD ||
      Math.abs(bounds.east - previousBoundsRef.current.east) > BOUNDS_THRESHOLD ||
      Math.abs(bounds.west - previousBoundsRef.current.west) > BOUNDS_THRESHOLD;

    if (!boundsChanged) {
      // Bounds haven't meaningfully changed - skip debounce
      return;
    }

    // Debounce the bounds update
    const handler = setTimeout(() => {
      setDebouncedBounds(bounds);
      previousBoundsRef.current = bounds;
    }, delay);

    return () => clearTimeout(handler);
  }, [bounds, delay]);

  return debouncedBounds;
}
