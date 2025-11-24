import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import type { PropertySearchRequest } from '../types';

interface BasicSearchFormProps {
  onSearch: (request: PropertySearchRequest) => void;
  loading?: boolean;
}

/**
 * Basic Search Form Component
 * Phase 1.3: Simple search interface for testing
 */
const BasicSearchForm: React.FC<BasicSearchFormProps> = ({ onSearch, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('NSW');
  const [selectedSuburb, setSelectedSuburb] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const handleSearch = () => {
    const request: PropertySearchRequest = {
      limit: 10, // Small limit for testing
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

    if (selectedSuburb.trim()) {
      request.suburbs = [selectedSuburb.trim()];
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

    console.log('🔍 [BasicSearchForm] Submitting search:', request);
    onSearch(request);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedSuburb('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Property Search (Phase 1.3 Testing)
      </Typography>

      <Grid container spacing={2}>
        {/* Text Search */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search Properties"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., apartment, waterfront, pool"
            variant="outlined"
            size="small"
          />
        </Grid>

        {/* State Selection */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>State</InputLabel>
            <Select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              label="State"
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

        {/* Suburb */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Suburb"
            value={selectedSuburb}
            onChange={(e) => setSelectedSuburb(e.target.value)}
            placeholder="e.g., Bondi Beach"
            variant="outlined"
            size="small"
          />
        </Grid>

        {/* Property Type */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Property Type</InputLabel>
            <Select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              label="Property Type"
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
            size="small"
            type="number"
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
            size="small"
            type="number"
          />
        </Grid>

        {/* Bedrooms */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Min Bedrooms</InputLabel>
            <Select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              label="Min Bedrooms"
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
            >
              {loading ? 'Searching...' : 'Search Properties'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={loading}
            >
              Clear Filters
            </Button>
          </Box>
        </Grid>

        {/* Active Filters Display */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedState && (
              <Chip label={`State: ${selectedState}`} size="small" color="primary" />
            )}
            {selectedSuburb && (
              <Chip label={`Suburb: ${selectedSuburb}`} size="small" color="primary" />
            )}
            {propertyType && (
              <Chip label={`Type: ${propertyType}`} size="small" color="primary" />
            )}
            {minPrice && (
              <Chip label={`Min: $${parseInt(minPrice).toLocaleString()}`} size="small" color="primary" />
            )}
            {maxPrice && (
              <Chip label={`Max: $${parseInt(maxPrice).toLocaleString()}`} size="small" color="primary" />
            )}
            {bedrooms && (
              <Chip label={`${bedrooms}+ bedrooms`} size="small" color="primary" />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BasicSearchForm;