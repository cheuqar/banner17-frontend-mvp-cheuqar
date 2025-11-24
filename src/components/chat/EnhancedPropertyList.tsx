import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Badge,
  Popover,
  List,
  ListItem
} from '@mui/material';
import {
  ViewList,
  Map as MapIcon,
  FilterList,
  Home,
  Apartment,
  Villa,
  Business,
  Bed,
  Bathtub,
  DriveEta,
  Square,
  Landscape,
  LocationOn
} from '@mui/icons-material';

// Import PropertyMap and PropertyHoverPreview (assume these exist)
// import { PropertyMap } from './PropertyMap';
// import { PropertyHoverPreview } from './PropertyHoverPreview';

interface PropertyItem {
  id: string;
  address?: string;
  full_address?: string;
  title?: string;
  price?: string | number;
  price_display?: string;
  propertyType?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  car_spaces?: number;
  carpark?: number;
  building_area?: number | string;
  land_area?: number | string;
  floor_area?: number | string;
  status?: string;
  listing_type?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number; // Distance from search location
  distance_text?: string; // Formatted distance text (e.g., "5.7km away")
}

interface EnhancedPropertyListProps {
  properties: PropertyItem[];
  title?: string;
  activeFilters?: Record<string, any>;
  onSendToAI?: (properties: PropertyItem[], message: string) => void;
  onCreatePropertyDrillSession?: (property: PropertyItem) => void;
}

type ViewMode = 'list' | 'map';

const EnhancedPropertyList: React.FC<EnhancedPropertyListProps> = ({
  properties = [],
  title,
  activeFilters = {},
  onSendToAI,
  onCreatePropertyDrillSession
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [hoverPreviewProperty, setHoverPreviewProperty] = useState<PropertyItem | null>(null);
  const [hoverPreviewVisible, setHoverPreviewVisible] = useState(false);
  const [hoverPreviewPosition, setHoverPreviewPosition] = useState({ x: 0, y: 0 });

  // Property type icon helper
  const getPropertyTypeIcon = (type?: string) => {
    if (!type) return <Home />;
    const lowerType = type.toLowerCase();
    if (lowerType.includes('apartment') || lowerType.includes('unit')) return <Apartment />;
    if (lowerType.includes('house') || lowerType.includes('villa')) return <Villa />;
    if (lowerType.includes('commercial') || lowerType.includes('office')) return <Business />;
    return <Home />;
  };

  // Format helpers
  const formatPrice = (price?: string | number) => {
    if (!price) return 'Price on request';
    if (typeof price === 'string') return price;
    return `$${price.toLocaleString()}`;
  };

  const formatFullAddress = (property: PropertyItem) => {
    return property.full_address || property.address || property.title || 'Address not available';
  };

  const getListingState = (property: PropertyItem) => {
    const status = property.status?.toLowerCase();
    const type = property.listing_type?.toLowerCase();
    
    if (status === 'sold') return 'Sold';
    if (type === 'rent' || type === 'rental') return 'Rent';
    return 'Sale';
  };

  // Active filters count
  const activeFilterCount = Object.keys(activeFilters).length;

  // Handle view mode change
  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Handle filter menu
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  // Handle property hover for preview
  const handlePropertyHover = (property: PropertyItem | null, event?: React.MouseEvent) => {
    if (property && event) {
      setHoverPreviewProperty(property);
      setHoverPreviewPosition({ x: event.clientX, y: event.clientY });
      setHoverPreviewVisible(true);
    } else {
      setHoverPreviewVisible(false);
      setTimeout(() => {
        if (!hoverPreviewVisible) {
          setHoverPreviewProperty(null);
        }
      }, 100);
    }
  };

  const closeHoverPreview = () => {
    setHoverPreviewVisible(false);
    setHoverPreviewProperty(null);
  };

  // Map data for PropertyMap component
  const mapData = useMemo(() => {
    const propertiesWithCoords = properties.filter(p => p.latitude && p.longitude);
    return {
      properties: propertiesWithCoords.map(p => ({
        id: p.id,
        name: formatFullAddress(p),
        latitude: p.latitude!,
        longitude: p.longitude!,
        price: formatPrice(p.price || p.price_display),
        propertyType: p.propertyType || p.property_type || 'Property'
      })),
      title: title || 'Property Locations'
    };
  }, [properties, title]);

  return (
    <Box sx={{ my: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {title}
              </Typography>
            )}
            
            {/* Property count and "more" indicator */}
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
              Found {properties.length} properties
              {properties.length >= 20 && (
                <Chip 
                  label="and there are more" 
                  size="small" 
                  sx={{ ml: 1, bgcolor: 'info.50', color: 'info.main' }}
                />
              )}
            </Typography>

            {/* Active filters summary */}
            {activeFilterCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                  Active Filters:
                </Typography>
                {Object.entries(activeFilters).slice(0, 3).map(([key, value]) => (
                  <Chip 
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {activeFilterCount > 3 && (
                  <Chip 
                    label={`+${activeFilterCount - 3} more`}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
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

            {/* Filter dropdown */}
            <Tooltip title="Active Filters">
              <IconButton 
                onClick={handleFilterMenuOpen}
                size="small"
                color={activeFilterCount > 0 ? 'primary' : 'default'}
              >
                <Badge badgeContent={activeFilterCount} color="primary" max={9}>
                  <FilterList />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Filter dropdown menu */}
      <Popover
        open={Boolean(filterMenuAnchor)}
        anchorEl={filterMenuAnchor}
        onClose={handleFilterMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Active Filters
          </Typography>
          {activeFilterCount > 0 ? (
            <List dense>
              {Object.entries(activeFilters).map(([key, value]) => (
                <ListItem key={key} sx={{ px: 0, py: 0.5 }}>
                  <Typography variant="body2">
                    <strong>{key}:</strong> {value}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No active filters
            </Typography>
          )}
        </Box>
      </Popover>

      {/* Content Display */}
      {viewMode === 'list' && (
        <Box sx={{ position: 'relative' }}>
          {/* Scrollable container for list */}
          <Box
            sx={{
              maxHeight: properties.length > 3 ? 400 : 'auto',
              overflowY: properties.length > 3 ? 'auto' : 'visible',
              pr: properties.length > 3 ? 1 : 0,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
                '&:hover': {
                  background: '#a8a8a8',
                },
              },
            }}
          >
            {properties.map((property, index) => {
              const propertyId = property.id || `property-${index}`;
              const propertyType = property.propertyType || property.property_type;
              const fullAddress = formatFullAddress(property);
              const listingState = getListingState(property);

              return (
                <Paper
                  key={propertyId}
                  onMouseEnter={(e) => handlePropertyHover(property, e)}
                  onMouseLeave={() => handlePropertyHover(null)}
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      elevation: 3,
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  {/* Line 1: Property Type + Address */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getPropertyTypeIcon(propertyType)}
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        textTransform: 'capitalize'
                      }}
                    >
                      {propertyType || 'Property'}
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {fullAddress}
                    </Typography>
                  </Box>

                  {/* Line 2: Price + Property Specs */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 1
                  }}>
                    {/* Listing state */}
                    <Chip
                      label={listingState}
                      size="small"
                      color={listingState === 'Sold' ? 'default' : listingState === 'Rent' ? 'info' : 'success'}
                      variant="outlined"
                    />
                    
                    {/* Price */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: listingState === 'Sold' ? 'text.secondary' : 'primary.main'
                      }}
                    >
                      {formatPrice(property.price || property.price_display)}
                    </Typography>

                    {/* Property specs */}
                    {property.bedrooms && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Bed sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{property.bedrooms}</Typography>
                      </Box>
                    )}

                    {property.bathrooms && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Bathtub sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{property.bathrooms}</Typography>
                      </Box>
                    )}

                    {(property.car_spaces || property.carpark) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DriveEta sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{property.car_spaces || property.carpark}</Typography>
                      </Box>
                    )}

                    {(property.building_area || property.floor_area) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Square sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {property.building_area || property.floor_area}
                          {typeof (property.building_area || property.floor_area) === 'number' ? 'm²' : ''}
                        </Typography>
                      </Box>
                    )}

                    {property.land_area && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Landscape sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {property.land_area}
                          {typeof property.land_area === 'number' ? 'm²' : ''}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Line 3: Distance and Additional Info */}
                  {(property.distance_km || property.distance_text) && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      mt: 0.5
                    }}>
                      <LocationOn sx={{ fontSize: 16, color: 'error.main' }} />
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                        {property.distance_text || (property.distance_km ? `${property.distance_km.toFixed(1)}km away` : '')}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <Box sx={{ height: 400, width: '100%' }}>
          {mapData.properties.length > 0 ? (
            <Paper sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}>
              <Typography color="text.secondary">
                Map View - {mapData.properties.length} properties with coordinates
              </Typography>
              {/* PropertyMap component would go here */}
              {/* <PropertyMap properties={mapData.properties} title={mapData.title} height={400} /> */}
            </Paper>
          ) : (
            <Paper sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.50'
            }}>
              <Typography color="text.secondary">
                No coordinate data available for mapping
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Property Hover Preview */}
      {hoverPreviewProperty && hoverPreviewVisible && (
        <Paper
          sx={{
            position: 'fixed',
            top: hoverPreviewPosition.y + 10,
            left: hoverPreviewPosition.x + 10,
            zIndex: 9999,
            p: 2,
            maxWidth: 300,
            bgcolor: 'background.paper',
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'grey.300'
          }}
          onMouseEnter={() => setHoverPreviewVisible(true)}
          onMouseLeave={closeHoverPreview}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {formatFullAddress(hoverPreviewProperty)}
          </Typography>
          <Typography variant="body1" color="primary.main" sx={{ fontWeight: 600 }}>
            {formatPrice(hoverPreviewProperty.price || hoverPreviewProperty.price_display)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hoverPreviewProperty.propertyType || hoverPreviewProperty.property_type || 'Property'}
          </Typography>
          
          {/* Quick specs */}
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            {hoverPreviewProperty.bedrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Bed sx={{ fontSize: 14 }} />
                <Typography variant="caption">{hoverPreviewProperty.bedrooms}</Typography>
              </Box>
            )}
            {hoverPreviewProperty.bathrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Bathtub sx={{ fontSize: 14 }} />
                <Typography variant="caption">{hoverPreviewProperty.bathrooms}</Typography>
              </Box>
            )}
            {(hoverPreviewProperty.car_spaces || hoverPreviewProperty.carpark) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DriveEta sx={{ fontSize: 14 }} />
                <Typography variant="caption">
                  {hoverPreviewProperty.car_spaces || hoverPreviewProperty.carpark}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Click for more details
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EnhancedPropertyList;