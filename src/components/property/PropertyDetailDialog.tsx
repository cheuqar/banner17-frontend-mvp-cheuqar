import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  Close,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bathtub,
  DriveEta,
  Square,
  Landscape,
  ContactPhone,
  Phone,
  CalendarToday,
  Launch,
  Bookmark,
  BookmarkBorder,
  Block,
  ExpandMore,
  LocationOn,
  Refresh,
} from '@mui/icons-material';

// Import helper functions and types that we'll need
import { formatFullAddress, getPropertyTypeIcon, getListingState, getPropertyImages } from '../../utils/propertyUtils';

// Import amenities functionality
import { usePropertyAmenities } from '../../hooks/usePropertyAmenities';
import { getCategoryInfo, formatDistance } from '../../services/amenitiesService';
import AmenityCategoryFilters from './AmenityCategoryFilters';
import AmenitiesMap from './AmenitiesMap';

// Import schools functionality
import SchoolsTab from './SchoolsTab';
import { schoolsService } from '../../services/schoolsService';

// Property interface for TypeScript
interface Property {
  id?: string;
  title?: string;
  price?: string | number;
  price_display?: string;
  bedrooms?: number;
  bathrooms?: number;
  car_spaces?: number;
  carpark?: number;
  building_area?: number;
  floor_area?: number;
  land_area?: number;
  property_type?: string;
  propertyType?: string;
  description?: string;
  agent_name?: string;
  agent_phone?: string;
  inspection_times?: string[];
  listing_url?: string;
  images?: (string | { url: string; type?: string })[];
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  status?: string;
  distance_km?: number;
  distance_text?: string;
  [key: string]: any; // For additional properties
}

interface PropertyDetailDialogProps {
  open: boolean;
  property: Property | null;
  properties?: Property[]; // For navigation between properties
  currentIndex?: number; // Current property index for navigation
  onClose: () => void;
  onPropertyChange?: (property: Property, index: number) => void; // Callback for property navigation
  onBookmarkToggle?: (property: Property) => void;
  onIgnoreToggle?: (property: Property) => void;
  bookmarkedProperties?: Set<string>;
  ignoredProperties?: Set<string>;
  enableNavigation?: boolean; // Whether to show navigation arrows
  lazyLoadProperty?: (propertyId: string) => Promise<Property>; // For lazy loading property details
}

const PropertyDetailDialog: React.FC<PropertyDetailDialogProps> = ({
  open,
  property,
  properties = [],
  currentIndex = 0,
  onClose,
  onPropertyChange,
  onBookmarkToggle,
  onIgnoreToggle,
  bookmarkedProperties = new Set(),
  ignoredProperties = new Set(),
  enableNavigation = false,
  lazyLoadProperty,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(property);
  const [currentTab, setCurrentTab] = useState(0);

  // Clear schools cache when dialog first opens for a property to ensure fresh data
  useEffect(() => {
    if (open && property?.id) {
      try {
        schoolsService.clearCacheForProperty(property.id);
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [open, property?.id]);

  // Category filter state for amenities
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'hospitals', 'libraries', 'shopping', 'schools',
    'beaches', 'sports', 'tourist_attractions'  // Include all backend-supported categories
  ]);

  // Amenities data hook - only loads when Amenities tab is active
  const {
    amenities,
    amenitiesByCategory,
    loading: amenitiesLoading,
    error: amenitiesError,
    totalFound: totalAmenitiesFound,
    searchTime: amenitiesSearchTime,
    propertyCoordinates,
    searchRadius,
    refetch: refetchAmenities
  } = usePropertyAmenities(
    propertyDetails?.id, 
    currentTab === 1, // Only active when Amenities tab is selected
    {
      categories: selectedCategories.length > 0 ? selectedCategories : ['hospitals', 'libraries', 'shopping', 'schools', 'beaches', 'sports', 'tourist_attractions'],
      limitPerCategory: 10,
      radiusKm: 8
    }
  );

  // Highlight selection state between list and map
  const [selectedAmenityId, setSelectedAmenityId] = useState<string | undefined>(undefined);

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setPropertyDetails(property);
  }, [property]);

  // Handle lazy loading of property details if needed
  useEffect(() => {
    const loadPropertyDetails = async () => {
      if (property && lazyLoadProperty && property.id) {
        setIsLoadingProperty(true);
        try {
          const fullProperty = await lazyLoadProperty(property.id);
          setPropertyDetails(fullProperty);
        } catch (error) {
          console.error('Failed to load property details:', error);
          setPropertyDetails(property); // Fallback to basic property data
        } finally {
          setIsLoadingProperty(false);
        }
      }
    };

    if (open && property) {
      loadPropertyDetails();
    }
  }, [open, property, lazyLoadProperty]);

  if (!propertyDetails) return null;

  const images = getPropertyImages(propertyDetails);
  const currentImage = images[currentImageIndex] || null;
  const listingState = getListingState(propertyDetails);
  const hasMultipleImages = images.length > 1;
  const fullAddress = formatFullAddress(propertyDetails);

  // Navigation handlers
  const navigateToPrevious = () => {
    if (enableNavigation && properties.length > 0 && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      onPropertyChange?.(properties[newIndex], newIndex);
    }
  };

  const navigateToNext = () => {
    if (enableNavigation && properties.length > 0 && currentIndex < properties.length - 1) {
      const newIndex = currentIndex + 1;
      onPropertyChange?.(properties[newIndex], newIndex);
    }
  };

  // Image navigation handlers
  const navigateToPreviousImage = () => {
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  };

  const navigateToNextImage = () => {
    setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1));
  };

  const handleBookmarkToggle = () => {
    if (onBookmarkToggle && propertyDetails) {
      onBookmarkToggle(propertyDetails);
    }
  };

  const handleIgnoreToggle = () => {
    if (onIgnoreToggle && propertyDetails) {
      onIgnoreToggle(propertyDetails);
    }
  };

  const handleOpenListing = () => {
    if (propertyDetails?.listing_url) {
      window.open(propertyDetails.listing_url, '_blank');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '95vw',
          height: '95vh',
          maxWidth: 'none',
          maxHeight: 'none',
          margin: 0,
          borderRadius: '16px',
          overflow: 'hidden',
        },
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Navigation and Close Button */}
        <Box sx={{ 
          position: 'relative', 
          p: 3, 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          flexShrink: 0,
        }}>
          {/* Left Navigation Arrow */}
          {enableNavigation && (
            <IconButton
              onClick={navigateToPrevious}
              disabled={currentIndex === 0}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                color: 'rgba(0, 0, 0, 0.7)',
                transition: 'all 0.2s ease',
                '&:hover:not(:disabled)': {
                  bgcolor: 'rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  color: '#000000',
                  transform: 'translateX(-2px)'
                },
                '&:disabled': {
                  opacity: 0.3,
                  cursor: 'not-allowed'
                }
              }}
            >
              <ChevronLeft sx={{ fontSize: 20 }} />
            </IconButton>
          )}

          {/* Property Counter */}
          {enableNavigation && properties.length > 0 && (
            <Typography variant="body2" sx={{ 
              color: 'rgba(0, 0, 0, 0.7)',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}>
              {currentIndex + 1} of {properties.length}
            </Typography>
          )}

          {/* Right Navigation Arrow */}
          {enableNavigation && (
            <IconButton
              onClick={navigateToNext}
              disabled={currentIndex === properties.length - 1}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                color: 'rgba(0, 0, 0, 0.7)',
                transition: 'all 0.2s ease',
                '&:hover:not(:disabled)': {
                  bgcolor: 'rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  color: '#000000',
                  transform: 'translateX(2px)'
                },
                '&:disabled': {
                  opacity: 0.3,
                  cursor: 'not-allowed'
                }
              }}
            >
              <ChevronRight sx={{ fontSize: 20 }} />
            </IconButton>
          )}

          {/* Property Title and Address */}
          <Box sx={{ flex: 1, mx: 2, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" sx={{
              fontWeight: 700,
              color: '#000000',
              mb: 0.5,
              lineHeight: 1.2,
            }}>
              {propertyDetails.title || fullAddress}
            </Typography>
            <Typography variant="body2" sx={{
              color: '#666666',
              fontSize: '0.875rem',
            }}>
              {fullAddress}
            </Typography>
          </Box>

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: 'transparent',
              border: '1px solid rgba(0, 0, 0, 0.15)',
              color: 'rgba(0, 0, 0, 0.7)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.3)',
                color: '#000000'
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'rgba(0, 0, 0, 0.6)',
                '&.Mui-selected': {
                  color: '#000000',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#000000',
              },
            }}
          >
            <Tab label="Property Detail" />
            <Tab label="Amenities" />
            <Tab label="Schools" />
          </Tabs>
        </Box>

        {/* Tab Content Area - Scrollable */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {isLoadingProperty ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px' 
            }}>
              <Typography>Loading property details...</Typography>
            </Box>
          ) : (
            <>
              {/* Property Detail Tab */}
              {currentTab === 0 && (
                <>
                  {/* Cover Photo Section with Slideshow */}
              {currentImage && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={currentImage}
                      alt={fullAddress}
                      sx={{
                        width: '100%',
                        height: 400, // Larger image for full-screen modal
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                      }}
                    />
                    
                    {/* Status Badge - Top Left */}
                    <Chip
                      label={listingState}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: listingState === 'Sold' ? 'rgba(158, 158, 158, 0.9)' : 
                                listingState === 'Rent' ? 'rgba(31, 170, 188, 0.9)' : 
                                'rgba(76, 175, 80, 0.9)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        backdropFilter: 'blur(4px)',
                        border: 'none'
                      }}
                    />
                    
                    {/* Image Counter - Top Right */}
                    {hasMultipleImages && (
                      <Chip
                        label={`${currentImageIndex + 1} of ${images.length}`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          backdropFilter: 'blur(4px)',
                          border: 'none'
                        }}
                      />
                    )}

                    {/* Save/Ignore Button Group */}
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      right: 60,
                      zIndex: 10,
                    }}>
                      <Box sx={{
                        display: 'flex',
                        gap: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: 1,
                        p: 0.5,
                      }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleBookmarkToggle}
                          startIcon={<Bookmark sx={{ fontSize: 16 }} />}
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '0.75rem',
                            px: 1.5,
                            py: 0.5,
                            minWidth: 'auto',
                            backgroundColor: bookmarkedProperties.has(propertyDetails?.id || '') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleIgnoreToggle}
                          startIcon={<Block sx={{ fontSize: 16 }} />}
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '0.75rem',
                            px: 1.5,
                            py: 0.5,
                            minWidth: 'auto',
                            backgroundColor: ignoredProperties.has(propertyDetails?.id || '') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          Ignore
                        </Button>
                      </Box>
                    </Box>
                    
                    {/* Left Navigation Arrow */}
                    {hasMultipleImages && currentImageIndex > 0 && (
                      <IconButton
                        onClick={navigateToPreviousImage}
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                          }
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>
                    )}
                    
                    {/* Right Navigation Arrow */}
                    {hasMultipleImages && currentImageIndex < images.length - 1 && (
                      <IconButton
                        onClick={navigateToNextImage}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                          }
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              )}

              {/* Property Details Section */}
              <Box>
                {/* Key Details Chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {propertyDetails.bedrooms && (
                    <Chip
                      icon={<Bed sx={{ fontSize: 18 }} />}
                      label={`${propertyDetails.bedrooms} Beds`}
                      variant="outlined"
                      size="medium"
                      sx={{ borderColor: 'rgba(0, 0, 0, 0.15)', color: 'text.secondary' }}
                    />
                  )}
                  {propertyDetails.bathrooms && (
                    <Chip
                      icon={<Bathtub sx={{ fontSize: 18 }} />}
                      label={`${propertyDetails.bathrooms} Baths`}
                      variant="outlined"
                      size="medium"
                      sx={{ borderColor: 'rgba(0, 0, 0, 0.15)', color: 'text.secondary' }}
                    />
                  )}
                  {(propertyDetails.car_spaces || propertyDetails.carpark) && (
                    <Chip
                      icon={<DriveEta sx={{ fontSize: 18 }} />}
                      label={`${propertyDetails.car_spaces || propertyDetails.carpark} Cars`}
                      variant="outlined"
                      size="medium"
                      sx={{ borderColor: 'rgba(0, 0, 0, 0.15)', color: 'text.secondary' }}
                    />
                  )}
                  {propertyDetails.land_area && (
                    <Chip
                      icon={<Landscape sx={{ fontSize: 18 }} />}
                      label={`${propertyDetails.land_area} m² Land`}
                      variant="outlined"
                      size="medium"
                      sx={{ borderColor: 'rgba(0, 0, 0, 0.15)', color: 'text.secondary' }}
                    />
                  )}
                  {propertyDetails.building_area && (
                    <Chip
                      icon={<Square sx={{ fontSize: 18 }} />}
                      label={`${propertyDetails.building_area} m² Bldg`}
                      variant="outlined"
                      size="medium"
                      sx={{ borderColor: 'rgba(0, 0, 0, 0.15)', color: 'text.secondary' }}
                    />
                  )}
                  {propertyDetails.property_type && (
                    <Chip
                      icon={getPropertyTypeIcon(propertyDetails.property_type)}
                      label={propertyDetails.property_type}
                      variant="outlined"
                      size="medium"
                      sx={{ borderColor: 'rgba(0, 0, 0, 0.15)', color: 'text.secondary' }}
                    />
                  )}
                </Box>

                {/* Description */}
                {propertyDetails.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'text.secondary', 
                      lineHeight: 1.7,
                      fontFamily: 'var(--font-secondary)'
                    }}>
                      {propertyDetails.description}
                    </Typography>
                  </Box>
                )}

                {/* Agent Details */}
                {(propertyDetails.agent_name || propertyDetails.agent_phone) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Agent Information
                    </Typography>
                    {propertyDetails.agent_name && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ContactPhone sx={{ fontSize: 20, color: '#000000' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {propertyDetails.agent_name}
                        </Typography>
                      </Box>
                    )}
                    {propertyDetails.agent_phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Phone sx={{ fontSize: 20, color: '#000000' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {propertyDetails.agent_phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Inspection Times */}
                {propertyDetails.inspection_times && propertyDetails.inspection_times.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Inspection Times
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 20, color: '#000000' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {propertyDetails.inspection_times.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                )}
                  </Box>
                </>
              )}

              {/* Amenities Tab - Two Panel Layout */}
              {currentTab === 1 && (
                <Box sx={{ display: 'flex', height: '100%', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* Left Panel: Amenities List */}
                  <Box sx={{ 
                    flex: { xs: '1 1 auto', md: '0 0 40%' }, 
                    display: 'flex', 
                    flexDirection: 'column',
                    minWidth: { xs: 'auto', md: '350px' }
                  }}>
                  {/* Header with summary and refresh */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Nearby Amenities
                      </Typography>
                      {propertyCoordinates && searchRadius && (
                        <Typography variant="body2" color="text.secondary">
                          Within {searchRadius}km of property
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {amenitiesSearchTime && (
                        <Typography variant="caption" color="text.secondary">
                          {amenitiesSearchTime}ms
                        </Typography>
                      )}
                      <IconButton
                        onClick={refetchAmenities}
                        disabled={amenitiesLoading}
                        size="small"
                        sx={{ color: '#000000' }}
                      >
                        <Refresh />
                      </IconButton>
                    </Box>
                  </Box>

                    {/* Category Filters */}
                    <AmenityCategoryFilters
                      amenitiesByCategory={amenitiesByCategory}
                      selectedCategories={selectedCategories}
                      onSelectionChange={setSelectedCategories}
                      loading={amenitiesLoading}
                      totalCount={totalAmenitiesFound}
                    />

                    {/* Scrollable Amenities List */}
                    <Box sx={{ flex: 1, overflowY: 'auto', mt: 2 }}>
                      {/* Loading State */}
                  {amenitiesLoading && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      py: 4 
                    }}>
                      <CircularProgress sx={{ color: '#000000', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Loading nearby amenities...
                      </Typography>
                    </Box>
                  )}

                  {/* Error State */}
                  {amenitiesError && !amenitiesLoading && (
                    <Alert 
                      severity="error" 
                      sx={{ mb: 2 }}
                      action={
                        <Button color="inherit" size="small" onClick={refetchAmenities}>
                          Retry
                        </Button>
                      }
                    >
                      Error loading amenities: {amenitiesError}
                    </Alert>
                  )}

                  {/* Success State - Show amenities by category */}
                  {!amenitiesLoading && !amenitiesError && totalAmenitiesFound > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Found {totalAmenitiesFound} amenities in {Object.keys(amenitiesByCategory).length} categories
                      </Typography>

                      {/* Amenities by Category */}
                      {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => {
                        const categoryInfo = getCategoryInfo(category);
                        
                        return (
                          <Accordion key={category} defaultExpanded sx={{ mb: 1 }}>
                            <AccordionSummary
                              expandIcon={<ExpandMore />}
                              sx={{
                                '& .MuiAccordionSummary-content': {
                                  alignItems: 'center'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                  {categoryInfo.icon} {categoryInfo.label}
                                </Typography>
                                <Badge 
                                  badgeContent={categoryAmenities.length} 
                                  color="primary"
                                  sx={{
                                    '& .MuiBadge-badge': {
                                      backgroundColor: '#000000',
                                      color: 'white'
                                    }
                                  }}
                                />
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0 }}>
                              <List dense>
                                {categoryAmenities
                                  .sort((a, b) => a.distance_km - b.distance_km) // Sort by distance
                                  .map((amenity, index) => (
                                    <ListItem 
                                      key={`${amenity.id || index}`} 
                                      sx={{ 
                                        py: 0.5,
                                        cursor: 'pointer',
                                        borderRadius: 1,
                                        bgcolor: selectedAmenityId && amenity.id === selectedAmenityId ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' }
                                      }}
                                      onClick={() => setSelectedAmenityId(amenity.id || undefined)}
                                    >
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <LocationOn sx={{ fontSize: 18, color: '#000000' }} />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {amenity.name}
                                            </Typography>
                                            <Chip
                                              label={formatDistance(amenity.distance_km)}
                                              size="small"
                                              variant="outlined"
                                              sx={{
                                                fontSize: '0.7rem',
                                                height: 20,
                                                borderColor: 'rgba(0, 0, 0, 0.25)',
                                                color: '#000000'
                                              }}
                                            />
                                          </Box>
                                        }
                                        secondary={
                                          <Box>
                                            {amenity.address && (
                                              <Typography variant="caption" color="text.secondary">
                                                {amenity.address}
                                              </Typography>
                                            )}
                                            {amenity.subtype && (
                                              <Typography variant="caption" color="text.secondary" sx={{ ml: amenity.address ? 1 : 0 }}>
                                                • {amenity.subtype}
                                              </Typography>
                                            )}
                                          </Box>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </Box>
                  )}

                  {/* No Results State */}
                  {!amenitiesLoading && !amenitiesError && totalAmenitiesFound === 0 && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'text.secondary'
                    }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        No amenities found
                  </Typography>
                      <Typography variant="body2">
                        No amenities were found within {searchRadius || 8}km of this property.
                        {propertyCoordinates ? '' : ' Property coordinates may not be available.'}
                  </Typography>
                      <Button
                        onClick={refetchAmenities}
                        sx={{ mt: 2, color: '#000000' }}
                        startIcon={<Refresh />}
                      >
                        Try Again
                      </Button>
                    </Box>
                  )}
                    </Box>
                  </Box>

                  {/* Right Panel: Map */}
                  <Box sx={{ 
                    flex: '1', 
                    minHeight: { xs: 320, md: 400 },
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    {propertyCoordinates ? (
                      <AmenitiesMap
                        propertyCoords={[propertyCoordinates.latitude, propertyCoordinates.longitude]}
                        amenities={Object.values(amenitiesByCategory).flat()}
                        selectedAmenity={selectedAmenityId}
                        onSelectAmenity={setSelectedAmenityId}
                        searchRadius={searchRadius || 8}
                        loading={amenitiesLoading}
                      />
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        flexDirection: 'column',
                        color: 'text.secondary'
                      }}>
                        <LocationOn sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                        <Typography variant="h6">Map Unavailable</Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', maxWidth: 300 }}>
                          Property coordinates are not available for this listing.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Schools Tab */}
              {currentTab === 2 && propertyDetails?.id && (
                <SchoolsTab propertyId={propertyDetails.id} />
              )}
            </>
          )}
        </Box>

        {/* Action Bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          flexShrink: 0,
        }}>
          {/* External Link Button */}
          {propertyDetails?.listing_url && (
            <Button
              variant="contained"
              startIcon={<Launch />}
              onClick={handleOpenListing}
              sx={{
                bgcolor: '#000000',
                '&:hover': {
                  bgcolor: '#333333',
                },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
              }}
            >
              View Original Listing
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailDialog;
