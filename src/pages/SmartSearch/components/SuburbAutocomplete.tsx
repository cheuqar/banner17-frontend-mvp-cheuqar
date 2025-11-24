import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { debounce } from 'lodash';
import {
  getSuburbAutocomplete,
  type SuburbSuggestion,
  type SuburbAutocompleteResponse,
} from '../../../services/smartSearchService';

interface CacheEntry {
  data: SuburbAutocompleteResponse;
  timestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_SIZE = 50;
const DEBOUNCE_MS = 300;

// Simple LRU cache implementation
class LRUCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): SuburbAutocompleteResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: SuburbAutocompleteResponse): void {
    // Delete if exists (to re-add at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // If at capacity, remove oldest (first) entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

const cache = new LRUCache(CACHE_SIZE);

function getCacheKey(query: string, state?: string, limit: number = 10): string {
  return `${query}:${state || ''}:${limit}`;
}

export interface SuburbAutocompleteProps {
  value: string | null;
  state?: string | null;
  onChange: (suburb: string | null, state: string | null, postcode: string | null) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

const SuburbAutocomplete: React.FC<SuburbAutocompleteProps> = ({
  value,
  state,
  onChange,
  disabled = false,
  label = 'Suburb',
  placeholder = 'e.g., Liverpool, Sydney',
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<SuburbSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch suggestions with cache check
  const fetchSuggestions = useCallback(async (query: string, stateFilter?: string | null) => {
    if (query.length < 2) {
      setOptions([]);
      setError(null);
      return;
    }

    const cacheKey = getCacheKey(query, stateFilter || undefined);
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log('🎯 [SuburbAutocomplete] Using cached results for:', query);
      setOptions(cached.suggestions);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getSuburbAutocomplete(
        query,
        stateFilter || undefined,
        10
      );
      cache.set(cacheKey, response);
      setOptions(response.suggestions);
    } catch (err) {
      console.error('❌ [SuburbAutocomplete] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch
  const debouncedFetch = useMemo(
    () => debounce((query: string, stateFilter?: string | null) => {
      fetchSuggestions(query, stateFilter);
    }, DEBOUNCE_MS),
    [fetchSuggestions]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  // Handle input change
  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    debouncedFetch(newInputValue, state);
  };

  // Handle selection
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: string | SuburbSuggestion | null
  ) => {
    // Handle freeSolo string input
    if (typeof newValue === 'string') {
      setInputValue(newValue);
      onChange(newValue, null, null);
    } else if (newValue) {
      setInputValue(newValue.suburb);
      onChange(newValue.suburb, newValue.state, newValue.postcode);
    } else {
      setInputValue('');
      onChange(null, null, null);
    }
  };

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]); // Only depend on value, not inputValue (avoid infinite loop)

  return (
    <Autocomplete
      freeSolo
      disabled={disabled}
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return `${option.suburb}, ${option.state} ${option.postcode}`;
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={`${option.suburb}-${option.state}-${option.postcode}`}>
          <Box>
            <Typography variant="body1">
              {option.suburb}, {option.state}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.postcode}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          InputLabelProps={{
            shrink: true,
            sx: {
              color: '#666',
              backgroundColor: '#F5F5F5',
              px: 0.5,
              '&.Mui-focused': {
                color: '#0b2d2c',
                backgroundColor: '#FFFFFF',
              },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#F5F5F5',
              '&:hover': {
                backgroundColor: '#EBEBEB',
              },
              '&.Mui-focused': {
                backgroundColor: '#FFFFFF',
                boxShadow: 'inset 0 0 0 1px #0b2d2c !important',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none !important',
                },
                '& .MuiOutlinedInput-input': {
                  outline: 'none !important',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E0E0E0',
              },
            },
            '& .MuiOutlinedInput-input': {
              outline: 'none !important',
            },
          }}
        />
      )}
      noOptionsText={
        inputValue.length < 2
          ? 'Type at least 2 characters'
          : loading
          ? 'Loading...'
          : error
          ? 'Error loading suggestions'
          : 'No matching suburbs'
      }
    />
  );
};

export default SuburbAutocomplete;
