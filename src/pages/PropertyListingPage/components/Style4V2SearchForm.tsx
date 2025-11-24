import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Autocomplete,
  InputAdornment,
  Container,
  Paper
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import style4V2Theme, { style4V2Styles } from '../theme/style4V2Theme';
import type { PropertySearchRequest } from '../types';
import { locationDataService, type LocationOption } from '../services/locationDataService';

interface Style4V2SearchFormProps {
  onSearch: (request: PropertySearchRequest) => void;
  loading?: boolean;
  hasBackgroundImage?: boolean;
  isCompact?: boolean;
}

/**
 * Style4-V2 Search Form Component
 * Elegant glass-style search form following Banner17's Style4-V2 design system
 */
const Style4V2SearchForm: React.FC<Style4V2SearchFormProps> = ({
  onSearch,
  loading = false,
  hasBackgroundImage = false,
  isCompact = false
}) => {
  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('NSW');
  const [selectedSuburb, setSelectedSuburb] = useState<LocationOption | null>(null);
  const [selectedPostcode, setSelectedPostcode] = useState<LocationOption | null>(null);
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // Debounce effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (suburbInputValue) {
        searchSuburbs(suburbInputValue);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [suburbInputValue, searchSuburbs]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (postcodeInputValue) {
        searchPostcodes(postcodeInputValue);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [postcodeInputValue, searchPostcodes]);

  // Clear dependent fields when state changes
  useEffect(() => {
    setSelectedSuburb(null);
    setSelectedPostcode(null);
    setSuburbOptions([]);
    setPostcodeOptions([]);
    locationDataService.clearCache();
  }, [selectedState]);

  useEffect(() => {
    if (selectedSuburb) {
      setSelectedPostcode(null);
      setPostcodeOptions([]);
    }
  }, [selectedSuburb]);

  const handleSearch = () => {
    const request: PropertySearchRequest = {
      limit: 20,
      offset: 0
    };

    if (searchQuery.trim()) request.query = searchQuery.trim();
    if (selectedState) request.states = [selectedState];
    if (selectedSuburb) request.suburbs = [selectedSuburb.suburb];
    if (propertyType) request.property_types = [propertyType];
    if (minPrice) request.price_min = parseInt(minPrice);
    if (maxPrice) request.price_max = parseInt(maxPrice);
    if (bedrooms) request.bedrooms_min = parseInt(bedrooms);

    console.log('🔍 [Style4V2SearchForm] Submitting search:', request);
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
    setShowAdvanced(false);
  };

  // Clean glass container style matching advanced filters approach
  const containerStyle = hasBackgroundImage ? {
    backgroundColor: isCompact ?
      'rgba(255, 255, 255, 0.95)' : // Clean white background when compact
      'rgba(255, 255, 255, 0.92)', // Slightly transparent for visual depth
    border: `2px solid ${style4V2Styles.colors.primaryBlack}`, // Standard border like advanced filters
    borderRadius: isCompact ? 2 : 4,
    backdropFilter: 'blur(15px)', // Subtle blur for elegance
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', // Clean shadow
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth transition
    '&:hover': {
      backgroundColor: style4V2Styles.colors.primaryWhite,
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
      transform: 'translateY(-2px)',
    }
  } : {
    backgroundColor: style4V2Styles.colors.backgroundLight,
    border: `1px solid ${style4V2Styles.colors.dividerColor}`,
    borderRadius: 2,
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <ThemeProvider theme={style4V2Theme}>
      <Container maxWidth="lg">
        <Paper
          elevation={hasBackgroundImage ? 0 : 1}
          sx={{
            ...containerStyle,
            p: isCompact ? (hasBackgroundImage ? 2.5 : 1.5) : (hasBackgroundImage ? 6 : 4),
            maxWidth: isCompact ? '100%' : style4V2Styles.maxWidths.form,
            mx: 'auto',
            transform: isCompact ? 'scale(0.75)' : 'scale(1)', // Even more compact scaling
            transformOrigin: 'top center', // Scale from top for better compact animation
          }}
        >
          {/* Header - Hidden in compact mode */}
          {!isCompact && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 800, // Extra bold for maximum readability
                  mb: 1,
                  color: style4V2Styles.colors.primaryBlack, // Always black for maximum contrast
                  textShadow: hasBackgroundImage ? '1px 1px 2px rgba(255, 255, 255, 0.8)' : 'none', // White text shadow for background images
                }}
              >
                Find Your Perfect Property
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: style4V2Styles.colors.primaryBlack, // Always black for maximum contrast
                  fontFamily: style4V2Styles.accentFont,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  fontWeight: 600, // Bold subtitle for better readability
                  textShadow: hasBackgroundImage ? '1px 1px 2px rgba(255, 255, 255, 0.8)' : 'none', // White text shadow for background images
                }}
              >
                Search across thousands of properties with ease
              </Typography>
            </Box>
          )}

          {/* Main Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., waterfront apartment, pool, new build..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: style4V2Styles.colors.primaryBlack }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: style4V2Styles.colors.primaryWhite,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '& input': {
                    fontWeight: 600, // Bold but not excessive
                    py: isCompact ? 1 : 2,
                    color: style4V2Styles.colors.primaryBlack,
                    fontSize: isCompact ? '1rem' : '1.1rem',
                  },
                  '& input::placeholder': {
                    color: '#666666',
                    fontWeight: 500,
                    opacity: 0.7,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: style4V2Styles.colors.primaryBlack,
                    borderWidth: '2px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: style4V2Styles.colors.primaryBlack,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: style4V2Styles.colors.primaryBlack,
                    borderWidth: '2px',
                  }
                }
              }}
            />
          </Box>

          {/* Location Fields */}
          <Grid container spacing={isCompact ? 2 : 3} sx={{ mb: isCompact ? 2 : 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  label="State"
                  sx={{
                    backgroundColor: style4V2Styles.colors.primaryWhite,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '& .MuiSelect-select': {
                      fontWeight: 600,
                      color: style4V2Styles.colors.primaryBlack,
                      py: isCompact ? 1 : 1.5,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: style4V2Styles.colors.primaryBlack,
                      borderWidth: '2px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: style4V2Styles.colors.primaryBlack,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: style4V2Styles.colors.primaryBlack,
                      borderWidth: '2px',
                    }
                  }}
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

            <Grid item xs={12} sm={4}>
              <Autocomplete
                value={selectedSuburb}
                onChange={(_, newValue) => setSelectedSuburb(newValue)}
                inputValue={suburbInputValue}
                onInputChange={(_, newInputValue) => setSuburbInputValue(newInputValue)}
                options={suburbOptions}
                getOptionLabel={(option) => option.suburb}
                isOptionEqualToValue={(option, value) =>
                  option.suburb === value.suburb && option.postcode === value.postcode
                }
                loading={loadingSuburbs}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Suburb"
                    placeholder="Start typing..."
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon sx={{ color: style4V2Styles.colors.primaryBlack }} />
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: style4V2Styles.colors.primaryWhite,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '& input': {
                          fontWeight: 600,
                          color: style4V2Styles.colors.primaryBlack,
                          py: isCompact ? 1 : 1.5,
                        },
                        '& input::placeholder': {
                          color: '#666666',
                          fontWeight: 500,
                          opacity: 0.7,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: style4V2Styles.colors.primaryBlack,
                          borderWidth: '2px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: style4V2Styles.colors.primaryBlack,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: style4V2Styles.colors.primaryBlack,
                          borderWidth: '2px',
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
                      sx: {
                        backgroundColor: style4V2Styles.colors.primaryWhite,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '& input': {
                          fontWeight: 600,
                          color: style4V2Styles.colors.primaryBlack,
                          py: isCompact ? 1 : 1.5,
                        },
                        '& input::placeholder': {
                          color: '#666666',
                          fontWeight: 500,
                          opacity: 0.7,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: style4V2Styles.colors.primaryBlack,
                          borderWidth: '2px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: style4V2Styles.colors.primaryBlack,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: style4V2Styles.colors.primaryBlack,
                          borderWidth: '2px',
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Advanced Filters Toggle */}
          <Box sx={{ mb: isCompact ? 1.5 : 3, textAlign: 'center' }}>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              startIcon={<TuneIcon />}
              size={isCompact ? "small" : "medium"}
              sx={{
                color: style4V2Styles.colors.primaryBlack,
                fontWeight: 700, // Extra bold for advanced filters button
                backgroundColor: style4V2Styles.colors.primaryWhite,
                border: `2px solid ${style4V2Styles.colors.primaryBlack}`, // Thicker border
                px: isCompact ? 2 : 3,
                py: isCompact ? 0.5 : 1,
                fontSize: isCompact ? '0.9rem' : '1rem', // Larger font size
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Add shadow for definition
                '&:hover': {
                  backgroundColor: style4V2Styles.colors.hoverOverlay,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
            </Button>
          </Box>

          {/* Advanced Filters */}
          {showAdvanced && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    label="Property Type"
                    sx={{ backgroundColor: style4V2Styles.colors.primaryWhite }}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="House">House</MenuItem>
                    <MenuItem value="Apartment / Unit / Flat">Apartment</MenuItem>
                    <MenuItem value="Townhouse">Townhouse</MenuItem>
                    <MenuItem value="Villa">Villa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="500000"
                  variant="outlined"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    sx: { backgroundColor: style4V2Styles.colors.primaryWhite }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="1000000"
                  variant="outlined"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    sx: { backgroundColor: style4V2Styles.colors.primaryWhite }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Min Bedrooms</InputLabel>
                  <Select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    label="Min Bedrooms"
                    sx={{ backgroundColor: style4V2Styles.colors.primaryWhite }}
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
            </Grid>
          )}

          {/* Action Buttons */}
          <Box sx={{
            display: 'flex',
            gap: isCompact ? 2 : 3,
            justifyContent: 'center',
            mb: isCompact ? 2 : 3,
            flexDirection: isCompact ? 'row' : 'row'
          }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              size={isCompact ? "medium" : "large"}
              startIcon={<SearchIcon />}
              sx={{
                px: isCompact ? 3 : 6,
                py: isCompact ? 1 : 2,
                fontSize: isCompact ? '1rem' : '1.2rem',
                fontWeight: 700,
                backgroundColor: style4V2Styles.colors.primaryBlack,
                color: style4V2Styles.colors.primaryWhite,
                border: `2px solid ${style4V2Styles.colors.primaryBlack}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                '&:hover': {
                  backgroundColor: style4V2Styles.colors.primaryBlackLight,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  transform: 'translateY(-1px)',
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
              size={isCompact ? "medium" : "large"}
              sx={{
                px: isCompact ? 2 : 4,
                py: isCompact ? 1 : 2,
                borderColor: style4V2Styles.colors.primaryBlack,
                color: style4V2Styles.colors.primaryBlack,
                backgroundColor: style4V2Styles.colors.primaryWhite,
                border: `2px solid ${style4V2Styles.colors.primaryBlack}`,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: style4V2Styles.colors.hoverOverlay,
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Clear
            </Button>
          </Box>

          {/* Active Filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {selectedState && (
              <Chip
                label={`${selectedState}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.dividerColor,
                  color: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.secondaryGray,
                }}
              />
            )}
            {selectedSuburb && (
              <Chip
                label={selectedSuburb.suburb}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.dividerColor,
                  color: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.secondaryGray,
                }}
              />
            )}
            {propertyType && (
              <Chip
                label={propertyType}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.dividerColor,
                  color: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.secondaryGray,
                }}
              />
            )}
            {(minPrice || maxPrice) && (
              <Chip
                label={`$${minPrice || '0'} - $${maxPrice || '∞'}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.dividerColor,
                  color: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.secondaryGray,
                }}
              />
            )}
            {bedrooms && (
              <Chip
                label={`${bedrooms}+ bedrooms`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.dividerColor,
                  color: hasBackgroundImage ? style4V2Styles.colors.lightGray : style4V2Styles.colors.secondaryGray,
                }}
              />
            )}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Style4V2SearchForm;