import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  Button,
  FormControlLabel,
  Paper,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  LocationOn,
  ViewList,
  Map as MapIcon,
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
  LocalAtm,
  ChevronRight,
  FilterList
} from '@mui/icons-material';
import PropertyMap from '../maps/PropertyMap';
import { DebugIdDisplay } from '../../utils/debugUtils';
import AmenityHoverPreview from './AmenityHoverPreview';

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

interface CompactEnhancedAmenitiesListProps {
  amenities: AmenityItem[];
  title?: string;
  subtitle?: string;
  active_filters?: Record<string, string>;
  onSendToAI?: (selectedAmenities: AmenityItem[], message: string) => void;
  referencePoints?: ReferencePoint[];
  dataObjects?: DataObjects;
}

type ViewMode = 'list' | 'map';

const CompactEnhancedAmenitiesList: React.FC<CompactEnhancedAmenitiesListProps> = ({
  amenities,
  title,
  subtitle,
  active_filters,
  onSendToAI,
  referencePoints = [],
  dataObjects
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  
  // Hover preview state
  const [hoverPreviewVisible, setHoverPreviewVisible] = useState(false);
  const [hoverPreviewAmenity, setHoverPreviewAmenity] = useState<AmenityItem | null>(null);
  const [hoverPreviewPosition, setHoverPreviewPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Active filters dropdown state
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const isFilterMenuOpen = Boolean(filterMenuAnchor);

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

  const handleAmenityHover = (amenity: AmenityItem | null, event?: React.MouseEvent) => {
    if (amenity && event) {
      // Show hover preview after a small delay
      const rect = event.currentTarget.getBoundingClientRect();
      setHoverPreviewPosition({
        top: rect.top + window.scrollY,
        left: rect.right + 10
      });
      setHoverPreviewAmenity(amenity);
      
      // Small delay to prevent flickering
      setTimeout(() => setHoverPreviewVisible(true), 300);
    }
    // Note: Don't hide preview on hover out - let it persist until close button is clicked
  };

  const handleCloseHoverPreview = () => {
    setHoverPreviewVisible(false);
    setHoverPreviewAmenity(null);
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const activeFilterCount = active_filters ? Object.keys(active_filters).length : 0;

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
      default:
        return 'default';
    }
  };

  const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  // Map data transformation for PropertyMap compatibility
  const mapData = useMemo(() => {
    const validAmenities = amenities.filter(a => 
      a.latitude && a.longitude && 
      !isNaN(Number(a.latitude)) && !isNaN(Number(a.longitude))
    ).map(a => ({
      ...a,
      address: a.address || a.name,
      price: a.subtype || a.category || 'Amenity',
      latitude: Number(a.latitude),
      longitude: Number(a.longitude)
    }));

    return {
      properties: validAmenities,
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
        
        {/* View Toggle and Filter Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
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
            <ToggleButton value="map" aria-label="map view" disabled={mapData.properties.length === 0}>
              <Tooltip title={mapData.properties.length === 0 ? "No coordinates available" : "Map View"}>
                <MapIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Compact Filter Button */}
          {activeFilterCount > 0 && (
            <Tooltip title="Active Filters">
              <IconButton
                size="small"
                onClick={handleFilterMenuOpen}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.50',
                  },
                }}
              >
                <Badge badgeContent={activeFilterCount} color="primary" max={9}>
                  <FilterList fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Active Filters Dropdown */}
      <Popover
        open={isFilterMenuOpen}
        anchorEl={filterMenuAnchor}
        onClose={handleFilterMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 250,
            maxWidth: 350,
            boxShadow: 3,
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.dark', mb: 1 }}>
            🔍 Active Filters
          </Typography>
          <List dense sx={{ pt: 0 }}>
            {active_filters && Object.entries(active_filters).map(([filterType, filterValue]) => (
              <ListItem key={filterType} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {filterType}:
                      </Typography>
                      <Chip
                        label={filterValue}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          '& .MuiChip-label': {
                            px: 1,
                            fontWeight: 500
                          }
                        }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>

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
                  Ask follow up
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
          
          {/* 🎨 COMPACT AMENITIES LIST - Redesigned to match Property List style */}
          <Box 
            sx={{ 
              maxHeight: amenities.length > 3 ? '280px' : 'auto', // Height for ~3.5 items (same as properties)
              overflowY: amenities.length > 3 ? 'auto' : 'visible',
              overflowX: 'hidden',
              pr: amenities.length > 3 ? 1 : 0,
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
            {amenities.length === 0 ? (
              // ✅ Empty State: Show helpful message when no amenities found
              <Box sx={{ 
                py: 4, 
                px: 2, 
                textAlign: 'center',
                color: 'text.secondary' 
              }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No amenities found in this area
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  Try searching in a different location or expanding your search radius
                </Typography>
              </Box>
            ) : (
              amenities.map((amenity, index) => {
              // Ensure unique key - handle null/undefined/empty values
              const uniqueKey = amenity.id && amenity.id !== 'null' && amenity.id !== 'None' 
                ? amenity.id 
                : `amenity-${index}`;
              const isSelected = selectedAmenities.has(amenity.id || '');
              
              return (
                <Box key={uniqueKey}>
                  <Box
                    onMouseEnter={(e) => handleAmenityHover(amenity, e)}
                    onMouseLeave={() => {
                      // Always use timeout-based hiding to prevent flickering
                      // No longer hide on hover out - let it persist until close button is clicked
                    }}
                    sx={{ 
                      py: 1.5,
                      px: 2,
                      cursor: 'pointer',
                      bgcolor: isSelected ? 'primary.50' : 'transparent',
                      border: isSelected ? '2px solid' : '2px solid transparent',
                      borderColor: isSelected ? 'primary.main' : 'transparent',
                      borderRadius: isSelected ? 1 : 0,
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.50' : 'grey.50',
                        borderRadius: 1,
                      },
                    }}
                  >
                    {/* Selection Checkbox - Top Right */}
                    {onSendToAI && amenity.id && (
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={(e) => handleAmenitySelect(amenity.id!, e.target.checked)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 5,
                        }}
                      />
                    )}

                    {/* Line 1: [Category Icon] [Amenity Name] - [Category Chip] */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, pr: onSendToAI ? 5 : 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getCategoryIcon(amenity.category)}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                          }}
                        >
                          {amenity.name}
                        </Typography>
                      </Box>

                      {amenity.category && (
                        <Chip 
                          label={amenity.category.replace('_', ' & ')}
                          size="small"
                          variant="outlined"
                          color={getCategoryColor(amenity.category) as any}
                          sx={{ ml: 'auto', fontSize: '0.7rem', height: '20px' }}
                        />
                      )}
                    </Box>

                    {/* Line 2: Address */}
                    {amenity.address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.85rem'
                          }}
                        >
                          {amenity.address}
                        </Typography>
                      </Box>
                    )}

                    {/* Line 3: Debug ID, Subtype, Distance, Coordinates */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      {/* Debug ID Display */}
                      <DebugIdDisplay id={amenity.id} />
                      
                      {amenity.subtype && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            fontWeight: 500,
                            bgcolor: 'grey.100',
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '0.7rem'
                          }}
                        >
                          {amenity.subtype}
                        </Typography>
                      )}

                      {amenity.distance_km !== undefined && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 600, 
                            color: 'primary.main',
                            fontSize: '0.75rem'
                          }}
                        >
                          {formatDistance(amenity.distance_km)} away
                        </Typography>
                      )}

                      {amenity.latitude && amenity.longitude && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.disabled',
                            fontSize: '0.65rem',
                            ml: 'auto'
                          }}
                        >
                          ({amenity.latitude.toFixed(4)}, {amenity.longitude.toFixed(4)})
                        </Typography>
                      )}
                    </Box>

                    {/* Optional Description (if present) */}
                    {amenity.description && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          display: 'block',
                          mt: 0.5,
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}
                      >
                        {amenity.description.length > 100 
                          ? `${amenity.description.substring(0, 100)}...` 
                          : amenity.description}
                      </Typography>
                    )}

                    {/* Hover Indicator (always visible, subtle) */}
                    {amenity.id && (
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: onSendToAI && amenity.id ? 40 : 8, // Adjust for checkbox if present
                          color: 'grey.400',
                          zIndex: 5,
                          cursor: 'default',
                          '&:hover': {
                            color: 'grey.600',
                            bgcolor: 'transparent',
                          },
                        }}
                      >
                        <ChevronRight fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {/* Divider between items (except last) */}
                  {index < amenities.length - 1 && (
                    <Divider sx={{ mx: 2 }} />
                  )}
                </Box>
              );
            }))}
          </Box>
        </>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <Box sx={{ height: 400, width: '100%' }}>
          {mapData.properties.length > 0 ? (
            <PropertyMap {...mapData} />
          ) : (
            <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No location data available for map display
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Hover Preview */}
      <AmenityHoverPreview
        amenity={hoverPreviewAmenity!}
        isVisible={hoverPreviewVisible && !!hoverPreviewAmenity}
        anchorPosition={hoverPreviewPosition}
        onClose={handleCloseHoverPreview}
        referenceLocation={dataObjects?.query_context?.spatial_context?.reference_location}
        onActionClick={(action, amenity) => {
          // Handle preview actions
          handleCloseHoverPreview(); // Close preview after action
          
          switch (action) {
            case 'directions':
              if (onSendToAI) {
                onSendToAI([amenity], `How do I get directions to ${amenity.name}?`);
              }
              break;
            case 'contact':
              if (onSendToAI) {
                onSendToAI([amenity], `What are the contact details for ${amenity.name}?`);
              }
              break;
            case 'info':
              if (onSendToAI) {
                onSendToAI([amenity], `Tell me more information about ${amenity.name}.`);
              }
              break;
            case 'followup':
              if (onSendToAI) {
                onSendToAI([amenity], `I'd like to know more about ${amenity.name}.`);
              }
              break;
            default:
              console.log('Unknown action:', action);
          }
        }}
      />
    </Box>
  );
};

export default CompactEnhancedAmenitiesList;
