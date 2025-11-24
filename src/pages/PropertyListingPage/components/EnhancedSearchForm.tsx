import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Autocomplete,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import type { PropertySearchRequest } from '../types';
import { locationDataService, type LocationOption } from '../services/locationDataService';

interface EnhancedSearchFormProps {
  onSearch: (request: PropertySearchRequest) => void;
  loading?: boolean;
}

/**
 * Enhanced Search Form Component
 * Features: Autocomplete suburbs, linked postcode filtering, modern UI
 */
const EnhancedSearchForm: React.FC<EnhancedSearchFormProps> = ({ onSearch, loading = false }) => {
  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('NSW');
  const [selectedSuburb, setSelectedSuburb] = useState<LocationOption | null>(null);
  const [selectedPostcode, setSelectedPostcode] = useState<LocationOption | null>(null);
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  // Autocomplete state
  const [suburbOptions, setSuburbOptions] = useState<LocationOption[]>([]);
  const [postcodeOptions, setPostcodeOptions] = useState<LocationOption[]>([]);
  const [suburbInputValue, setSuburbInputValue] = useState('');
  const [postcodeInputValue, setPostcodeInputValue] = useState('');
  const [loadingSuburbs, setLoadingSuburbs] = useState(false);
  const [loadingPostcodes, setLoadingPostcodes] = useState(false);

  // Debounced suburb search
  const searchSuburbs = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuburbOptions([]);
      return;
    }

    setLoadingSuburbs(true);
    try {
      const suggestions = await locationDataService.getSuburbSuggestions(
        query,
        selectedState,
        15
      );
      setSuburbOptions(suggestions);
    } catch (error) {
      console.error('Error searching suburbs:', error);
      setSuburbOptions([]);
    } finally {
      setLoadingSuburbs(false);
    }
  }, [selectedState]);

  // Debounced postcode search
  const searchPostcodes = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPostcodeOptions([]);
      return;
    }

    setLoadingPostcodes(true);
    try {
      const suggestions = await locationDataService.getPostcodeSuggestions(
        query,
        selectedState,
        selectedSuburb?.suburb,
        15
      );
      setPostcodeOptions(suggestions);
    } catch (error) {
      console.error('Error searching postcodes:', error);
      setPostcodeOptions([]);
    } finally {
      setLoadingPostcodes(false);
    }
  }, [selectedState, selectedSuburb]);

  // Debounce suburb input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (suburbInputValue) {
        searchSuburbs(suburbInputValue);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [suburbInputValue, searchSuburbs]);

  // Debounce postcode input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (postcodeInputValue) {
        searchPostcodes(postcodeInputValue);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [postcodeInputValue, searchPostcodes]);

  // Clear suburb when state changes
  useEffect(() => {
    setSelectedSuburb(null);
    setSelectedPostcode(null);
    setSuburbOptions([]);
    setPostcodeOptions([]);
    locationDataService.clearCache();
  }, [selectedState]);

  // Clear postcode when suburb changes
  useEffect(() => {
    if (selectedSuburb) {
      // Auto-set postcode if suburb has only one postcode
      setSelectedPostcode(null);
      setPostcodeOptions([]);
    }
  }, [selectedSuburb]);

  const handleSearch = () => {
    const request: PropertySearchRequest = {
      limit: 20,
      offset: 0
    };

    // Add query if provided
    if (searchQuery.trim()) {
      request.query = searchQuery.trim();
    }

    // Add location filters
    if (selectedState) {
      request.states = [selectedState];
    }

    if (selectedSuburb) {
      request.suburbs = [selectedSuburb.suburb];
    }

    // Add postcode if different from suburb's postcode
    if (selectedPostcode && selectedPostcode.postcode !== selectedSuburb?.postcode) {
      // Note: We'll need to add postcode support to the API request format
      // For now, we'll filter by suburb that matches the postcode
      if (!selectedSuburb) {
        request.suburbs = [selectedPostcode.suburb];
      }
    }

    // Add property type filter
    if (propertyType) {
      request.property_types = [propertyType];
    }

    // Add price filters
    if (minPrice) {
      request.price_min = parseInt(minPrice);
    }

    if (maxPrice) {
      request.price_max = parseInt(maxPrice);
    }

    // Add bedrooms filter
    if (bedrooms) {
      request.bedrooms_min = parseInt(bedrooms);
    }

    console.log('🔍 [EnhancedSearchForm] Submitting search:', request);
    onSearch(request);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedSuburb(null);
    setSelectedPostcode(null);
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setSuburbInputValue('');
    setPostcodeInputValue('');
    setSuburbOptions([]);
    setPostcodeOptions([]);
  };

  return (
    <Paper elevation={2} sx={{
      p: 4,
      mb: 3,
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      border: '1px solid #e3f2fd'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SearchIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
        <Typography variant="h5" component="h2" sx={{
          fontWeight: 600,
          color: 'primary.main',
          flex: 1
        }}>
          Find Your Perfect Property
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Text Search */}
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Search Properties"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., waterfront apartment, pool, new build"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              }
            }}
          />
        </Grid>

        {/* State Selection */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>State</InputLabel>
            <Select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              label="State"
              sx={{ backgroundColor: 'white' }}
            >
              <MenuItem value="NSW">NSW</MenuItem>
              <MenuItem value="VIC">VIC</MenuItem>
              <MenuItem value="QLD">QLD</MenuItem>
              <MenuItem value="SA">SA</MenuItem>
              <MenuItem value="WA">WA</MenuItem>
              <MenuItem value="TAS">TAS</MenuItem>
              <MenuItem value="ACT">ACT</MenuItem>
              <MenuItem value="NT">NT</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }}>
            <Chip label="Location" size="small" color="primary" variant="outlined" />
          </Divider>
        </Grid>

        {/* Suburb Autocomplete */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            value={selectedSuburb}
            onChange={(_, newValue) => setSelectedSuburb(newValue)}
            inputValue={suburbInputValue}
            onInputChange={(_, newInputValue) => setSuburbInputValue(newInputValue)}
            options={suburbOptions}
            getOptionLabel={(option) => option.displayName}
            isOptionEqualToValue={(option, value) =>
              option.suburb === value.suburb && option.postcode === value.postcode
            }
            loading={loadingSuburbs}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Suburb"
                placeholder="Start typing suburb name..."
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { backgroundColor: 'white' }
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {option.suburb}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.state} {option.postcode}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </Grid>

        {/* Postcode Autocomplete */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            value={selectedPostcode}
            onChange={(_, newValue) => setSelectedPostcode(newValue)}
            inputValue={postcodeInputValue}
            onInputChange={(_, newInputValue) => setPostcodeInputValue(newInputValue)}
            options={postcodeOptions}
            getOptionLabel={(option) => option.postcode}
            isOptionEqualToValue={(option, value) =>
              option.postcode === value.postcode && option.suburb === value.suburb
            }
            loading={loadingPostcodes}
            disabled={!selectedState}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Postcode"
                placeholder="Enter postcode..."
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  sx: { backgroundColor: 'white' }
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {option.postcode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.suburb}, {option.state}
                  </Typography>
                </Box>
              </li>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }}>
            <Chip label="Property Details" size="small" color="primary" variant="outlined" />
          </Divider>
        </Grid>

        {/* Property Type */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              label="Property Type"
              sx={{ backgroundColor: 'white' }}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="House">House</MenuItem>
              <MenuItem value="Apartment / Unit / Flat">Apartment</MenuItem>
              <MenuItem value="Townhouse">Townhouse</MenuItem>
              <MenuItem value="Villa">Villa</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Min Price */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="500000"
            variant="outlined"
            type="number"
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        {/* Max Price */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="1000000"
            variant="outlined"
            type="number"
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'white' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        {/* Bedrooms */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Min Bedrooms</InputLabel>
            <Select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              label="Min Bedrooms"
              sx={{ backgroundColor: 'white' }}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="1">1+</MenuItem>
              <MenuItem value="2">2+</MenuItem>
              <MenuItem value="3">3+</MenuItem>
              <MenuItem value="4">4+</MenuItem>
              <MenuItem value="5">5+</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Search Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              size="large"
              startIcon={<SearchIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {loading ? 'Searching...' : 'Search Properties'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={loading}
              startIcon={<ClearIcon />}
              sx={{ px: 3, py: 1.5 }}
            >
              Clear Filters
            </Button>
          </Box>
        </Grid>

        {/* Active Filters Display */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedState && (
              <Chip
                label={`State: ${selectedState}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {selectedSuburb && (
              <Chip
                label={`Suburb: ${selectedSuburb.suburb}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {selectedPostcode && selectedPostcode.postcode !== selectedSuburb?.postcode && (
              <Chip
                label={`Postcode: ${selectedPostcode.postcode}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {propertyType && (
              <Chip
                label={`Type: ${propertyType}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {minPrice && (
              <Chip
                label={`Min: $${parseInt(minPrice).toLocaleString()}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {maxPrice && (
              <Chip
                label={`Max: $${parseInt(maxPrice).toLocaleString()}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {bedrooms && (
              <Chip
                label={`${bedrooms}+ bedrooms`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EnhancedSearchForm;