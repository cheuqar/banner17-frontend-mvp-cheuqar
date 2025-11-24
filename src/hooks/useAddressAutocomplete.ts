/**
 * Hook: useAddressAutocomplete
 * 
 * Custom hook for address autocomplete with debounced search and state detection
 * Replicates Address Research panel logic for consistent UX (Research D2)
 * 
 * Features:
 * - Debounced search (200ms) to reduce API calls
 * - State code extraction for Q1 auto-clear logic
 * - Error handling with user-friendly messages
 */

import { useState, useEffect, useCallback } from 'react';
import type { AddressSuggestion, StateCode } from '../types/searchFilters';

// Issue #2 fix: Correct API endpoint path with /smart-search/ segment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
const AUTOCOMPLETE_ENDPOINT = `${API_BASE_URL}/api/v1/smart-search/address/autocomplete`;

interface UseAddressAutocompleteOptions {
  debounceMs?: number;              // Debounce delay (default: 200ms)
  onStateDetected?: (state: StateCode) => void;  // Callback when state is detected from selection
}

interface UseAddressAutocompleteReturn {
  suggestions: AddressSuggestion[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSuggestionSelect: (suggestion: AddressSuggestion) => void;
}

/**
 * Custom hook for address autocomplete
 */
export const useAddressAutocomplete = (
  options: UseAddressAutocompleteOptions = {}
): UseAddressAutocompleteReturn => {
  const { debounceMs = 200, onStateDetected } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch autocomplete suggestions from API
   */
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Issue #2 fix: Backend uses GET method, not POST
      const url = `${AUTOCOMPLETE_ENDPOINT}?query=${encodeURIComponent(query.trim())}&limit=8`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Please enter a valid address');
        } else if (response.status === 503) {
          throw new Error('Service temporarily unavailable');
        } else {
          throw new Error('Unable to load suggestions');
        }
      }

      const data = await response.json();
      
      // Issue #2 fix: Transform backend response format to match frontend interface
      // Backend returns: { suggestions: [{ formatted, lat, lon, state, suburb, postcode }] }
      // Frontend expects: { id, label, address, state, postcode }
      const transformedSuggestions: AddressSuggestion[] = (data.suggestions || []).map((item: any, index: number) => ({
        id: `${item.suburb || 'unknown'}-${item.state || 'unknown'}-${item.postcode || index}`,
        label: item.formatted || item.address || 'Unknown location',
        address: item.suburb || item.formatted || '',
        state: item.state as StateCode,
        postcode: item.postcode || '',
      }));
      
      setSuggestions(transformedSuggestions);
      
      console.log('[AddressAutocomplete] Fetched suggestions:', transformedSuggestions.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suggestions';
      setError(errorMessage);
      setSuggestions([]);
      console.error('[AddressAutocomplete] Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Debounced search effect
   * Wait 200ms after user stops typing before making API call
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, debounceMs);

    // Cleanup: cancel pending API call if user types again
    return () => clearTimeout(timeoutId);
  }, [searchQuery, debounceMs, fetchSuggestions]);

  /**
   * Handle suggestion selection
   * Extracts state from selection and calls onStateDetected callback
   */
  const handleSuggestionSelect = useCallback((suggestion: AddressSuggestion) => {
    console.log('[AddressAutocomplete] Suggestion selected:', suggestion.label);
    
    // Extract state code for Q1 auto-clear logic
    if (onStateDetected && suggestion.state) {
      onStateDetected(suggestion.state);
    }

    // Clear suggestions after selection
    setSuggestions([]);
    setSearchQuery(suggestion.label);  // Update search query with selected value
  }, [onStateDetected]);

  return {
    suggestions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    handleSuggestionSelect,
  };
};

