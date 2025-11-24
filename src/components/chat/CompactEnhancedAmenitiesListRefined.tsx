import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Button
} from '@mui/material';
import {
  LocalHospital,
  LocalLibrary,
  ShoppingCart,
  School,
  Place,
  FilterList,
  ViewList,
  Map as MapIcon,
  Launch,
  BookmarkBorder,
  Block
} from '@mui/icons-material';

interface AmenityItem {
  id?: string;
  name: string;
  address?: string;
  category?: string;
  subtype?: string;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  source_url?: string;
  [key: string]: any;
}

interface CompactEnhancedAmenitiesListRefinedProps {
  amenities: AmenityItem[];
  title?: string;
  onSendToAI?: (selectedAmenities: AmenityItem[], message?: string) => void;
}

type ViewMode = 'list' | 'map';

const CompactEnhancedAmenitiesListRefined: React.FC<CompactEnhancedAmenitiesListRefinedProps> = ({
  amenities = [],
  title,
  onSendToAI
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [bookmarkedAmenities, setBookmarkedAmenities] = useState<Set<string>>(new Set());

  // Category icon helper
  const getCategoryIcon = (category?: string) => {
    if (!category) return <Place />;
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('hospital')) return <LocalHospital />;
    if (lowerCategory.includes('librar')) return <LocalLibrary />;
    if (lowerCategory.includes('shop')) return <ShoppingCart />;
    if (lowerCategory.includes('school') || lowerCategory.includes('universit')) return <School />;
    return <Place />;
  };

  // Category color helper
  const getCategoryColor = (category?: string) => {
    if (!category) return 'default';
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('hospital')) return 'error';
    if (lowerCategory.includes('librar')) return 'primary';
    if (lowerCategory.includes('shop')) return 'success';
    if (lowerCategory.includes('school') || lowerCategory.includes('universit')) return 'info';
    return 'default';
  };

  // Format distance
  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  // Calculate container height - show at least 5 items with buffer
  const calculateContainerHeight = () => {
    const itemHeight = 70; // Approximate height of each compact amenity item
    const minItems = 5;
    const buffer = 20;
    
    if (amenities.length <= minItems) {
      return 'auto';
    }
    return (minItems * itemHeight) + buffer;
  };

  // Handle view mode change
  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Handle amenity actions
  const handleBookmarkToggle = (amenity: AmenityItem) => {
    const amenityId = amenity.id || amenity.name;
    setBookmarkedAmenities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(amenityId)) {
        newSet.delete(amenityId);
      } else {
        newSet.add(amenityId);
      }
      return newSet;
    });
  };

  const handleOpenUrl = (amenity: AmenityItem) => {
    if (amenity.source_url) {
      window.open(amenity.source_url, '_blank');
    }
  };

  // Handle multi-select
  const handleSelectToggle = (amenity: AmenityItem) => {
    const amenityId = amenity.id || amenity.name;
    setSelectedAmenities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(amenityId)) {
        newSet.delete(amenityId);
      } else {
        newSet.add(amenityId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedAmenities.size === amenities.length) {
      setSelectedAmenities(new Set());
    } else {
      setSelectedAmenities(new Set(amenities.map(a => a.id || a.name)));
    }
  };

  const handleSendToAI = () => {
    const selected = amenities.filter(a => selectedAmenities.has(a.id || a.name));
    if (onSendToAI && selected.length > 0) {
      onSendToAI(selected, `Tell me more about these ${selected.length} amenities`);
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.5 }}>
                {title}
              </Typography>
            )}
            
            {/* Amenity count */}
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
              Found {amenities.length} amenities
              {amenities.length >= 5 && (
                <Chip 
                  label="and there are more" 
                  size="small" 
                  sx={{ ml: 1, bgcolor: 'info.50', color: 'info.main' }}
                />
              )}
            </Typography>

            {/* Selection controls */}
            {selectedAmenities.size > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2" color="primary.main">
                  {selectedAmenities.size} selected
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSendToAI}
                  disabled={selectedAmenities.size === 0}
                >
                  Ask AI about selected
                </Button>
              </Box>
            )}
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {/* Select All / Clear All */}
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectAll}
            >
              {selectedAmenities.size === amenities.length ? 'Clear All' : 'Select All'}
            </Button>

            {/* View mode toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="list" aria-label="list view">
                <Tooltip title="List View">
                  <ViewList />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="map" aria-label="map view">
                <Tooltip title="Map View">
                  <MapIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* Content Display */}
      {viewMode === 'list' && (
        <Box sx={{ position: 'relative' }}>
          {amenities.length === 0 ? (
            <Box sx={{ py: 4, px: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body1">No amenities found in this area</Typography>
              <Typography variant="body2">Try searching in a different location or expanding your search radius</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                maxHeight: calculateContainerHeight(),
                overflowY: amenities.length > 5 ? 'auto' : 'visible',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '3px',
                  '&:hover': {
                    background: '#a8a8a8',
                  },
                },
              }}
            >
              {amenities.map((amenity, index) => {
                const amenityId = amenity.id || amenity.name;
                const uniqueKey = amenity.id && amenity.id !== 'null' && amenity.id !== 'None' 
                  ? amenity.id : `amenity-${index}`;
                const isSelected = selectedAmenities.has(amenityId);
                const isBookmarked = bookmarkedAmenities.has(amenityId);

                return (
                  <React.Fragment key={uniqueKey}>
                    <Box
                      onClick={() => handleSelectToggle(amenity)}
                      sx={{
                        px: 2,
                        py: 1.5, // Reduced padding
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'rgba(31, 170, 188, 0.05)' : 'transparent', // SLEEK: transparent or subtle brand
                        transition: 'all 0.3s ease', // SLEEK: smooth transitions  
                        '&:hover': {
                          bgcolor: isSelected ? 'rgba(31, 170, 188, 0.08)' : 'rgba(31, 170, 188, 0.02)' // SLEEK: subtle hover
                        }
                      }}
                    >
                      {/* Compact Amenity Item */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Category icon and basic info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          {getCategoryIcon(amenity.category)}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {amenity.name}
                            </Typography>
                            {amenity.address && (
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {amenity.address}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Category and distance */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {amenity.category && (
                            <Chip
                              label={amenity.category}
                              size="small"
                              color={getCategoryColor(amenity.category)}
                              variant="outlined"
                            />
                          )}
                          
                          {amenity.distance_km && (
                            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 50, textAlign: 'right' }}>
                              {formatDistance(amenity.distance_km)}
                            </Typography>
                          )}

                          {/* Action buttons */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Bookmark">
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookmarkToggle(amenity);
                                }}
                                size="small"
                              >
                                <BookmarkBorder color={isBookmarked ? 'primary' : 'inherit'} />
                              </IconButton>
                            </Tooltip>

                            {amenity.source_url && (
                              <Tooltip title="Open details">
                                <IconButton 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenUrl(amenity);
                                  }}
                                  size="small"
                                >
                                  <Launch />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Description if available */}
                      {amenity.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1, 
                            fontSize: '0.8rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {amenity.description}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Single divider separator (except for last item) */}
                    {index < amenities.length - 1 && (
                      <Divider />
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <Box sx={{ height: 400, width: '100%' }}>
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'grey.100',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2
          }}>
            <Typography color="text.secondary">
              Map View - Amenity locations would be displayed here
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CompactEnhancedAmenitiesListRefined;
