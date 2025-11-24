import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  Button,
  FormControlLabel,
  Paper
} from '@mui/material';
import {
  LocationOn,
  ViewList,
  Map as MapIcon,
  Send,
  LocalHospital,
  LocalLibrary,
  ShoppingCart,
  School,
  Business,
  Place,
  BookmarkAdd,
  Restaurant,
  LocalGasStation,
  LocalParking,
  FitnessCenter,
  LocalPharmacy,
  AccountBalance,
  LocalAtm
} from '@mui/icons-material';
import PropertyMap from '../maps/PropertyMap';
import { DebugIdDisplay } from '../../utils/debugUtils';

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
  [key: string]: any;
}

interface ReferencePoint {
  id: string;
  type: "reference_point";
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
}

interface SpatialContext {
  has_spatial_search: boolean;
  center_coordinates?: { lat: number; lng: number };
  reference_location?: string;
}

interface QueryContext {
  scope: string;
  tool_used: string;
  timestamp: string;
  category: string;
  filters: any;
  spatial_context: SpatialContext;
}

interface DataObjects {
  amenities?: AmenityItem[];
  reference_points?: ReferencePoint[];
  query_context?: QueryContext;
  aggregations?: any;
}

interface EnhancedAmenitiesListProps {
  amenities: AmenityItem[];
  title?: string;
  subtitle?: string;
  onSendToAI?: (selectedAmenities: AmenityItem[], message: string) => void;
  referencePoints?: ReferencePoint[];
  dataObjects?: DataObjects;
}

type ViewMode = 'list' | 'map';

const EnhancedAmenitiesList: React.FC<EnhancedAmenitiesListProps> = ({
  amenities,
  title,
  subtitle,
  onSendToAI,
  referencePoints = [],
  dataObjects
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleAmenitySelect = (amenityId: string, checked: boolean) => {
    setSelectedAmenities(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(amenityId);
      } else {
        newSet.delete(amenityId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAmenities(new Set(amenities.filter(a => a.id).map(a => a.id!)));
    } else {
      setSelectedAmenities(new Set());
    }
  };

  const handleSendSelected = () => {
    const selected = amenities.filter(a => a.id && selectedAmenities.has(a.id));
    if (selected.length > 0 && onSendToAI) {
      const message = `I'd like to know more about these ${selected.length} selected amenities.`;
      onSendToAI(selected, message);
      setSelectedAmenities(new Set()); // Clear selection after sending
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'hospitals':
      case 'hospital':
        return <LocalHospital sx={{ fontSize: 18, color: 'error.main' }} />;
      case 'libraries':
      case 'library':
        return <LocalLibrary sx={{ fontSize: 18, color: 'primary.main' }} />;
      case 'shopping':
      case 'shopping_centres':
      case 'shopping_centers':
      case 'mall':
      case 'malls':
        return <ShoppingCart sx={{ fontSize: 18, color: 'success.main' }} />;
      case 'universities_tafe':
      case 'university':
      case 'universities':
      case 'tafe':
      case 'school':
      case 'schools':
      case 'education':
        return <School sx={{ fontSize: 18, color: 'info.main' }} />;
      case 'restaurants':
      case 'restaurant':
      case 'food':
      case 'dining':
        return <Restaurant sx={{ fontSize: 18, color: 'warning.main' }} />;
      case 'gas_stations':
      case 'gas_station':
      case 'fuel':
      case 'petrol':
        return <LocalGasStation sx={{ fontSize: 18, color: 'grey.600' }} />;
      case 'parking':
        return <LocalParking sx={{ fontSize: 18, color: 'grey.600' }} />;
      case 'fitness':
      case 'gym':
      case 'gyms':
        return <FitnessCenter sx={{ fontSize: 18, color: 'secondary.main' }} />;
      case 'pharmacy':
      case 'pharmacies':
        return <LocalPharmacy sx={{ fontSize: 18, color: 'error.light' }} />;
      case 'bank':
      case 'banks':
        return <AccountBalance sx={{ fontSize: 18, color: 'primary.dark' }} />;
      case 'atm':
      case 'atms':
        return <LocalAtm sx={{ fontSize: 18, color: 'primary.dark' }} />;
      default:
        return <Place sx={{ fontSize: 18, color: 'text.secondary' }} />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'hospitals':
      case 'hospital':
        return 'error';
      case 'libraries':
      case 'library':
        return 'primary';
      case 'shopping':
      case 'shopping_centres':
      case 'shopping_centers':
      case 'mall':
      case 'malls':
        return 'success';
      case 'universities_tafe':
      case 'university':
      case 'universities':
      case 'tafe':
      case 'school':
      case 'schools':
      case 'education':
        return 'info';
      case 'restaurants':
      case 'restaurant':
      case 'food':
      case 'dining':
        return 'warning';
      case 'gas_stations':
      case 'gas_station':
      case 'fuel':
      case 'petrol':
      case 'parking':
        return 'default';
      case 'fitness':
      case 'gym':
      case 'gyms':
        return 'secondary';
      case 'pharmacy':
      case 'pharmacies':
        return 'error';
      case 'bank':
      case 'banks':
      case 'atm':
      case 'atms':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  // Get enhanced distance information for an amenity
  const getDistanceInfo = (amenity: AmenityItem) => {
    const spatialContext = dataObjects?.query_context?.spatial_context;
    
    // If distance is already provided, use it
    if (amenity.distance_km) {
      return {
        distance: amenity.distance_km,
        fromCenter: true,
        centerLocation: spatialContext?.reference_location
      };
    }
    
    // If we have spatial search context and amenity coordinates, calculate distance
    if (spatialContext?.has_spatial_search && 
        spatialContext.center_coordinates && 
        amenity.latitude && 
        amenity.longitude) {
      const distance = calculateDistance(
        spatialContext.center_coordinates.lat,
        spatialContext.center_coordinates.lng,
        amenity.latitude,
        amenity.longitude
      );
      return {
        distance,
        fromCenter: true,
        centerLocation: spatialContext.reference_location
      };
    }
    
    return null;
  };

  // Prepare map data
  const mapData = useMemo(() => {
    const validAmenities = amenities.filter(a => 
      a.latitude !== null && 
      a.latitude !== undefined && 
      a.longitude !== null && 
      a.longitude !== undefined
    );

    return {
      properties: validAmenities.map((amenity, index) => ({
        id: amenity.id && amenity.id !== 'null' && amenity.id !== 'None' 
          ? amenity.id 
          : amenity.name || `amenity-map-${index}`,
        address: amenity.address || amenity.name,
        latitude: amenity.latitude!,
        longitude: amenity.longitude!,
        price: amenity.category,
        propertyType: amenity.subtype || amenity.category,
        description: amenity.description || `${amenity.name} - ${amenity.category}`,
        // Map amenities to property-like structure for map component
        title: amenity.name,
        amenity_category: amenity.category
      })),
      title: title || 'Amenity Locations',
      center: validAmenities.length > 0 ? {
        lat: validAmenities.reduce((sum, a) => sum + a.latitude!, 0) / validAmenities.length,
        lng: validAmenities.reduce((sum, a) => sum + a.longitude!, 0) / validAmenities.length
      } : undefined
    };
  }, [amenities, title]);

  return (
    <Box sx={{ my: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Spatial Search Context Display */}
        {dataObjects?.query_context?.spatial_context?.has_spatial_search && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                📍 Spatial Search Active
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Showing amenities near{' '}
              {dataObjects.query_context.spatial_context.reference_location || 'specified location'}
              {dataObjects.query_context.spatial_context.center_coordinates && (
                <> ({dataObjects.query_context.spatial_context.center_coordinates.lat.toFixed(4)}, {dataObjects.query_context.spatial_context.center_coordinates.lng.toFixed(4)})</>
              )}
            </Typography>
          </Paper>
        )}
        
        {/* View Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{ ml: 2 }}
        >
          <ToggleButton value="list" aria-label="list view">
            <Tooltip title="List View">
              <ViewList />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="map" aria-label="map view" disabled={mapData.properties.length === 0}>
            <Tooltip title={mapData.properties.length === 0 ? "No coordinates available" : "Map View"}>
              <MapIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Selection Controls */}
      {onSendToAI && amenities.some(a => a.id) && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAmenities.size === amenities.filter(a => a.id).length && selectedAmenities.size > 0}
                  indeterminate={selectedAmenities.size > 0 && selectedAmenities.size < amenities.filter(a => a.id).length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              }
              label="Select All"
            />
            
            {selectedAmenities.size > 0 && (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {selectedAmenities.size} selected
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<BookmarkAdd />}
                  onClick={handleSendSelected}
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                    boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                  }}
                >
                  Add to mentions
                </Button>
              </>
            )}
          </Box>
        </Paper>
      )}

      {/* Content Display */}
      {viewMode === 'list' && (
        <>
          {/* Scroll indicator when list is long */}
          {amenities.length > 3 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                fontStyle: 'italic',
                mb: 1,
                display: 'block'
              }}
            >
              📜 List is scrollable ({amenities.length} amenities)
            </Typography>
          )}
          
          <Box 
            sx={{ 
              maxHeight: amenities.length > 3 ? '600px' : 'auto', // Scroll if more than 3 amenities
              overflowY: amenities.length > 3 ? 'auto' : 'visible',
              overflowX: 'hidden',
              pr: amenities.length > 3 ? 1 : 0, // Add padding for scrollbar
              border: amenities.length > 3 ? '1px solid' : 'none',
              borderColor: amenities.length > 3 ? 'grey.200' : 'transparent',
              borderRadius: amenities.length > 3 ? 1 : 0,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'grey.100',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: '3px',
                '&:hover': {
                  bgcolor: 'grey.500',
                },
              },
            }}
          >
            <Grid container spacing={2}>
              {amenities.map((amenity, index) => {
                // Ensure unique key - handle null/undefined/empty values
                const uniqueKey = amenity.id && amenity.id !== 'null' && amenity.id !== 'None' 
                  ? amenity.id 
                  : `amenity-${index}`;
                return (
                <Grid item xs={12} key={uniqueKey}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <CardContent sx={{ pb: 2 }}>
                      {/* Selection Checkbox */}
                      {onSendToAI && amenity.id && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                          <Checkbox
                            size="small"
                            checked={selectedAmenities.has(amenity.id)}
                            onChange={(e) => handleAmenitySelect(amenity.id!, e.target.checked)}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          {/* Debug ID Display */}
                          <DebugIdDisplay id={amenity.id} />
                          
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getCategoryIcon(amenity.category)}
                            {amenity.name}
                          </Typography>
                          
                          {amenity.address && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              📍 {amenity.address}
                            </Typography>
                          )}

                          {amenity.description && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              {amenity.description}
                            </Typography>
                          )}
                        </Box>
                        
                        {amenity.category && (
                          <Chip 
                            icon={getCategoryIcon(amenity.category)}
                            label={amenity.category.replace('_', ' & ')}
                            size="small"
                            variant="outlined"
                            color={getCategoryColor(amenity.category) as any}
                          />
                        )}
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        {amenity.subtype && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Business sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {amenity.subtype}
                            </Typography>
                          </Box>
                        )}
                        
                        {(() => {
                          const distanceInfo = getDistanceInfo(amenity);
                          if (distanceInfo) {
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOn sx={{ fontSize: 18, color: 'success.main' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                  {formatDistance(distanceInfo.distance)}
                                  {distanceInfo.centerLocation && (
                                    <Typography component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary', ml: 0.5 }}>
                                      from {distanceInfo.centerLocation}
                                    </Typography>
                                  )}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        })()}
                        
                        {amenity.latitude && amenity.longitude && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                              {amenity.latitude.toFixed(4)}, {amenity.longitude.toFixed(4)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                );
              })}
            </Grid>
          </Box>
        </>
      )}

      {viewMode === 'map' && (
        <Box sx={{ height: 400, width: '100%' }}>
          {mapData.properties.length > 0 ? (
            <PropertyMap 
              properties={mapData.properties} 
              title={mapData.title}
              height={400}
              referencePoints={referencePoints}
            />
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
    </Box>
  );
};

export default EnhancedAmenitiesList;
