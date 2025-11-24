import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { centerMapAtLocation, clearMappedArea } from '../../../../store/slices/smartSearchSlice';

interface AddressSuggestion {
  formatted: string;
  lat: number;
  lon: number;
  state?: string;
  suburb?: string;
  postcode?: string;
  country?: string;
}

interface AddressAutocompleteResponse {
  suggestions: AddressSuggestion[];
  query: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';

const AddressSearchPanel: React.FC = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions function
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/smart-search/address/autocomplete?query=${encodeURIComponent(searchQuery)}&limit=5`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: AddressAutocompleteResponse = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Address search failed:', err);
      setError('Failed to search addresses. Please try again.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    setValidationError(null);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length >= 3) {
      // Debounce with 300ms delay
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    // Validate State + Suburb minimum
    if (!suggestion.state || !suggestion.suburb) {
      setValidationError(
        'Selected address must include both state and suburb. Please choose a more specific location.'
      );
      return;
    }

    // Clear validation error
    setValidationError(null);

    // NEW: Auto-clear any existing mapped area (Phase 2.5.7)
    // User explicitly chose new location, so replace previous map area
    dispatch(clearMappedArea());

    // Dispatch action to center map
    dispatch(
      centerMapAtLocation({
        lat: suggestion.lat,
        lon: suggestion.lon,
        zoom: 14,
        address: suggestion.formatted,
      })
    );

    // Update input field
    setQuery(suggestion.formatted);
    setSuggestions([]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Search for an address
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter a state and suburb (e.g., "NSW, Bondi") to navigate the map.
      </Typography>

      <TextField
        fullWidth
        placeholder="Enter state and suburb..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
          ),
          endAdornment: loading ? <CircularProgress size={20} /> : null,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
          },
        }}
      />

      {/* Validation Error */}
      {validationError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {validationError}
        </Alert>
      )}

      {/* API Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <List
          sx={{
            mt: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {suggestions.map((suggestion, index) => {
            const hasRequiredFields = suggestion.state && suggestion.suburb;

            return (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => handleSelectAddress(suggestion)}
                  disabled={!hasRequiredFields}
                  sx={{
                    opacity: hasRequiredFields ? 1 : 0.5,
                  }}
                >
                  <LocationIcon
                    sx={{
                      mr: 1.5,
                      color: hasRequiredFields ? 'primary.main' : 'text.disabled',
                      fontSize: 20,
                    }}
                  />
                  <ListItemText
                    primary={suggestion.formatted}
                    secondary={
                      suggestion.suburb && suggestion.state
                        ? `${suggestion.suburb}, ${suggestion.state}${
                            suggestion.postcode ? ` ${suggestion.postcode}` : ''
                          }`
                        : 'Incomplete address information'
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: hasRequiredFields ? 'text.secondary' : 'error.main',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      {/* No Results */}
      {!loading && query.length >= 3 && suggestions.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          No addresses found. Try a different search.
        </Typography>
      )}

      {/* Help Text */}
      {!query && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Tip:</strong> Start typing a suburb name with the state (e.g., "Bondi NSW" or
            "Melbourne VIC") to see address suggestions.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AddressSearchPanel;
