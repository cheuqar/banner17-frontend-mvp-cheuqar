import React, { useState, useEffect } from 'react';
import {
  Container,
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
  Checkbox,
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
  Launch,
  Bookmark,
  BookmarkBorder,
  Block,
  VisibilityOff,
  VisibilityOffOutlined,
  ExpandMore,
  LocalHospital,
  LibraryBooks,
  ShoppingCart,
  School,
  BeachAccess,
  SportsBasketball,
  CameraAlt,
  Business,
} from '@mui/icons-material';

// Import helper functions and types
import { formatFullAddress, getPropertyTypeIcon, getListingState } from '../../utils/propertyUtils';

// Import amenities functionality
import { usePropertyAmenities } from '../../hooks/usePropertyAmenities';
import { getCategoryInfo, formatDistance } from '../../services/amenitiesService';
import AmenitiesMap from './AmenitiesMap';

// Import schools functionality
import SchoolsTab from './SchoolsTab';
import { schoolsService } from '../../services/schoolsService';

// Import enhanced components
import EnhancedImageSlideshow from './enhanced/EnhancedImageSlideshow';
import AgentContactCard from './enhanced/AgentContactCard';
import InspectionTimesCard from './enhanced/InspectionTimesCard';
import PropertyMetadataCard from './enhanced/PropertyMetadataCard';
import FeaturesCard from './enhanced/FeaturesCard';
// Removed responsive layout hook to fix scrolling issues
import { enhanceProperty, createAgentDetails, createPropertyMetadata } from '../../utils/propertyEnhancedUtils';
import type { EnhancedProperty, PropertyImage, InspectionTime } from '../../types/property-enhanced';

// Property interface matching existing structure
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
  agent_email?: string;
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
  [key: string]: any;
}

interface PropertyDetailPageProps {
  property: Property | null;
  properties?: Property[];
  currentIndex?: number;
  onNavigateBack?: () => void;
  onPropertyChange?: (property: Property, index: number) => void;
  onBookmarkToggle?: (property: Property) => void;
  onIgnoreToggle?: (property: Property) => void;
  bookmarkedProperties?: Set<string>;
  ignoredProperties?: Set<string>;
  enableNavigation?: boolean;
  lazyLoadProperty?: (propertyId: string) => Promise<Property>;
  isStandalonePage?: boolean; // Whether this is used as a standalone page (with header/footer) or as a dialog
}

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  properties = [],
  currentIndex = 0,
  onNavigateBack,
  onPropertyChange,
  onBookmarkToggle,
  onIgnoreToggle,
  bookmarkedProperties = new Set(),
  ignoredProperties = new Set(),
  enableNavigation = false,
  lazyLoadProperty,
  isStandalonePage = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<Property | null>(property);
  const [currentTab, setCurrentTab] = useState(0);

  // Simple layout configuration without responsive hooks

  // Clear schools cache when property changes
  useEffect(() => {
    if (property?.id) {
      try {
        schoolsService.clearCacheForProperty(property.id);
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [property?.id]);

  // Category filter state for amenities
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'hospitals', 'libraries', 'shopping', 'schools',
    'beaches', 'sports', 'tourist_attractions'
  ]);

  // Amenities data hook
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
    currentTab === 1,
    {
      categories: selectedCategories.length > 0 ? selectedCategories : ['hospitals', 'libraries', 'shopping', 'schools', 'beaches', 'sports', 'tourist_attractions'],
      limitPerCategory: 10,
      radiusKm: 8
    },
    propertyDetails // Pass property details to check coordinates
  );

  // Highlight selection state between list and map
  const [selectedAmenityId, setSelectedAmenityId] = useState<string | undefined>(undefined);

  // State for accordion expansion (separate from filter selection)
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});

  // Reset state when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setPropertyDetails(property);
  }, [property]);

  // Handle lazy loading of property details
  useEffect(() => {
    const loadPropertyDetails = async () => {
      if (property && lazyLoadProperty && property.id) {
        setIsLoadingProperty(true);
        try {
          const fullProperty = await lazyLoadProperty(property.id);
          setPropertyDetails(fullProperty);
        } catch (error) {
          console.error('Failed to load property details:', error);
          setPropertyDetails(property);
        } finally {
          setIsLoadingProperty(false);
        }
      }
    };

    if (property) {
      loadPropertyDetails();
    }
  }, [property, lazyLoadProperty]);

  if (!propertyDetails) return null;

  // Enhanced property data processing
  const enhancedProperty: EnhancedProperty = enhanceProperty(propertyDetails);
  const propertyImages: PropertyImage[] = (enhancedProperty.images || []) as PropertyImage[];
  const propertyFloorplans: PropertyImage[] = (enhancedProperty.floorplans || []) as PropertyImage[];
  const agentDetails = createAgentDetails(enhancedProperty);
  const propertyMetadata = createPropertyMetadata(enhancedProperty);

  const listingState = getListingState(propertyDetails);
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

  // Get icon for amenity category
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      'hospitals': <LocalHospital />,
      'libraries': <LibraryBooks />,
      'shopping': <ShoppingCart />,
      'schools': <School />,
      'universities': <School />,
      'beaches': <BeachAccess />,
      'sports': <SportsBasketball />,
      'tourist_attractions': <CameraAlt />,
      'restaurants': <Business />,
    };
    return iconMap[category] || <Business />;
  };

  return (
    <div style={{
      minHeight: isStandalonePage ? 'auto' : '100vh',
      height: 'auto',  // Override MUI 100vh constraint
      backgroundColor: isStandalonePage ? 'transparent' : '#f5f5f5',
      width: '100%',
      paddingTop: isStandalonePage ? '2rem' : '0',
      paddingBottom: isStandalonePage ? '2rem' : '0',
    }}>
      {/* Header with Navigation and Back Button */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        <div style={{
          position: 'relative',
          padding: '24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
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

          {/* Back/Close Button - Only show for non-standalone page */}
          {!isStandalonePage && onNavigateBack && (
            <IconButton
              onClick={onNavigateBack}
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
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        <div style={{ borderBottom: '1px solid #e0e0e0' }}>
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
        </div>
      </div>

      {/* Tab Content Area */}
      <div style={{
        width: '100%',
        padding: '24px 0'
      }}>
        {isLoadingProperty ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px'
          }}>
            <Typography>Loading property details...</Typography>
          </div>
        ) : (
          <>
            {/* Property Detail Tab */}
            {currentTab === 0 && (
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 24px'
              }}>
                    {/* Enhanced Image Slideshow - Only in Property Detail Tab */}
                    {propertyImages.length > 0 && (
                      <Box sx={{ mb: 3, position: 'relative' }}>
                        <EnhancedImageSlideshow
                          images={propertyImages}
                          floorplans={propertyFloorplans}
                          currentIndex={currentImageIndex}
                          onImageChange={setCurrentImageIndex}
                          fullWidth={false}
                        />

                        {/* Save/Ignore Button Group Overlay */}
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
                      </Box>
                    )}

                    {/* Two-Column Layout for Enhanced Content */}
                    <div style={{
                      display: 'flex',
                      gap: '24px',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}>
                      {/* Left Column - Property Details */}
                      <div style={{
                        flex: 1
                      }}>
                        <Typography variant="h4" component="h2" sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: '#000000',
                          fontFamily: 'var(--font-primary)'
                        }}>
                          {propertyDetails.title || fullAddress}
                        </Typography>

                        <Typography variant="h5" sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: 'text.primary',
                          fontFamily: 'var(--font-secondary)'
                        }}>
                          {propertyDetails.price_display || (propertyDetails.price ? `$${propertyDetails.price.toLocaleString()}` : 'Price on Application')}
                        </Typography>

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

                        {/* Notes (formerly Tags) */}
                        {enhancedProperty.tags && Array.isArray(enhancedProperty.tags) && enhancedProperty.tags.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                              Notes
                            </Typography>
                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                              {enhancedProperty.tags.map((tag, index) => (
                                <li key={index} style={{ marginBottom: 6, color: 'var(--mui-palette-text-secondary)' }}>
                                  <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
                                    {tag}
                                  </Typography>
                                </li>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </div>

                      {/* Right Column - Enhanced Cards */}
                      <div style={{
                        flex: '0 0 350px',
                        minWidth: '350px'
                      }}>
                        {/* Agent Contact Card */}
                        <AgentContactCard
                          agent={agentDetails}
                          onContactClick={(method, value) => {
                            console.log(`Contact via ${method}:`, value);
                          }}
                          compact={false}
                        />

                        {/* Inspection Times Card */}
                        {enhancedProperty.inspection_times && enhancedProperty.inspection_times.length > 0 && (
                          <InspectionTimesCard
                            inspections={enhancedProperty.inspection_times as InspectionTime[]}
                            onScheduleReminder={(inspection) => {
                              console.log('Schedule reminder for:', inspection);
                            }}
                          />
                        )}

                        {/* Property Metadata Card */}
                        <PropertyMetadataCard
                          metadata={propertyMetadata}
                          onExternalLinkClick={(url) => {
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                        />

                        {/* Features Card */}
                        {propertyDetails?.features && (
                          <FeaturesCard features={propertyDetails.features} />
                        )}
                      </div>
                    </div>
              </div>
            )}

            {/* Amenities Tab - Full width and height */}
            {currentTab === 1 && (
              <div style={{
                display: 'flex',
                gap: '16px',
                flexDirection: 'row',
                width: '100%',
                maxWidth: isStandalonePage ? '1400px' : 'none',
                margin: isStandalonePage ? '0 auto' : '0',
                height: 'calc(100vh - 200px)', // Use full height minus header/tabs
                minHeight: '600px',
                paddingLeft: '16px',
                paddingRight: '16px'
              }}>
                    {/* Left Panel: Integrated Amenities List with Filter Headers */}
                    <div style={{
                      flex: '0 0 25%',
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: '300px',
                      height: '100%',
                      overflow: 'auto',
                      paddingRight: '8px',
                      WebkitOverflowScrolling: 'touch'
                    }}>
                      {/* Amenities List with Integrated Filter Headers */}
                      <div style={{
                        flex: 'unset',
                        overflow: 'visible'
                      }}>
                        {amenitiesError ? (
                          <div style={{ padding: '20px' }}>
                            {amenitiesError === 'coordinates_unavailable' ? (
                              <Alert
                                severity="info"
                                sx={{ mb: 2 }}
                                action={
                                  <Button
                                    onClick={() => window.open('mailto:report@banner17.ai?subject=Property Location Issue&body=Property ID: ' + propertyDetails?.id + '%0A%0AThis property is missing location coordinates. Please add latitude/longitude data so we can show nearby amenities.', '_blank')}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: '#2196f3', borderColor: '#2196f3' }}
                                  >
                                    Report Issue
                                  </Button>
                                }
                              >
                                Amenities nearby is not available for this property due to missing location information.
                              </Alert>
                            ) : (
                              <Alert
                                severity={amenitiesError.includes('valid address') || amenitiesError.includes('location data') ? "warning" : "error"}
                                sx={{ mb: 2 }}
                                action={
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {(amenitiesError.includes('valid address') || amenitiesError.includes('location data')) && (
                                      <Button
                                        onClick={() => window.open('mailto:report@banner17.ai?subject=Property Address Issue&body=Property ID: ' + propertyDetails?.id + '%0A%0APlease fix the address/location data for this property.', '_blank')}
                                        size="small"
                                        variant="outlined"
                                        sx={{ color: '#ff9800', borderColor: '#ff9800' }}
                                      >
                                        Report Issue
                                      </Button>
                                    )}
                                    <Button onClick={refetchAmenities} size="small">
                                      Retry
                                    </Button>
                                  </Box>
                                }
                              >
                                {amenitiesError.includes('valid address') || amenitiesError.includes('location data') ? amenitiesError : `Failed to load amenities: ${amenitiesError}`}
                              </Alert>
                            )}
                          </div>
                        ) : amenitiesLoading ? (
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Typography>Loading amenities...</Typography>
                          </div>
                        ) : (
                          <div>
                            {/* Quick Actions Bar */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '16px',
                              padding: '8px 12px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}>
                              <Typography variant="caption" color="text.secondary">
                                {totalAmenitiesFound} amenities found
                              </Typography>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => {
                                    const allCategories = Object.keys(amenitiesByCategory);
                                    setSelectedCategories(allCategories);
                                  }}
                                  sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                                >
                                  Show All
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => setSelectedCategories([])}
                                  sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                                >
                                  Hide All
                                </Button>
                              </div>
                            </div>

                            {/* Accordion with Integrated Filters */}
                            {Object.entries(amenitiesByCategory).map(([category, amenities]) => {
                              const isSelected = selectedCategories.includes(category);
                              const isExpanded = isSelected && (expandedAccordions[category] !== false); // Default to expanded when selected

                              const categoryConfig = {
                                hospitals: { color: '#f44336', label: 'Hospitals & Medical' },
                                libraries: { color: '#2196f3', label: 'Libraries' },
                                shopping: { color: '#4caf50', label: 'Shopping Centers' },
                                schools: { color: '#ff9800', label: 'Schools & Education' },
                                beaches: { color: '#00bcd4', label: 'Beaches & Waterfront' },
                                sports: { color: '#9c27b0', label: 'Sports & Recreation' },
                                tourist_attractions: { color: '#795548', label: 'Tourist Attractions' },
                                universities: { color: '#673ab7', label: 'Universities & TAFE' }
                              }[category] || { color: '#757575', label: category.replace('_', ' ') };

                              const handleCategoryToggle = (e: React.MouseEvent) => {
                                e.stopPropagation(); // Prevent accordion toggle
                                const newSelection = isSelected
                                  ? selectedCategories.filter(cat => cat !== category)
                                  : [...selectedCategories, category];
                                setSelectedCategories(newSelection);
                              };

                              const handleAccordionToggle = () => {
                                if (isSelected) {
                                  setExpandedAccordions(prev => ({
                                    ...prev,
                                    [category]: !isExpanded
                                  }));
                                }
                              };

                              return (
                                <Accordion
                                  key={category}
                                  expanded={isExpanded}
                                  onChange={handleAccordionToggle}
                                  sx={{
                                    mb: 1,
                                    boxShadow: 'none',
                                    border: `1px solid ${isSelected ? categoryConfig.color : '#e0e0e0'}`,
                                    '&:before': { display: 'none' },
                                    borderRadius: '8px !important',
                                    opacity: isSelected ? 1 : 0.7,
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={isSelected ? <ExpandMore sx={{ color: categoryConfig.color }} /> : null}
                                    sx={{
                                      backgroundColor: isSelected ? `${categoryConfig.color}15` : '#f8f9fa',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      '& .MuiAccordionSummary-content': {
                                        alignItems: 'center',
                                        gap: 1,
                                        margin: '8px 0'
                                      },
                                      '&:hover': {
                                        backgroundColor: isSelected ? `${categoryConfig.color}25` : '#f0f0f0'
                                      },
                                      // Override MUI's accordion click behavior
                                      '& .MuiAccordionSummary-expandIcon': {
                                        '&:hover': {
                                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        }
                                      }
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flex: 1,
                                        cursor: 'pointer'
                                      }}
                                      onClick={handleCategoryToggle}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        sx={{
                                          color: categoryConfig.color,
                                          '&.Mui-checked': { color: categoryConfig.color },
                                          mr: 1
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      {getCategoryIcon(category)}
                                      <Typography variant="subtitle1" sx={{
                                        fontWeight: 600,
                                        color: isSelected ? categoryConfig.color : 'text.primary',
                                        textTransform: 'capitalize',
                                        flex: 1
                                      }}>
                                        {categoryConfig.label}
                                      </Typography>
                                      <Chip
                                        label={amenities.length}
                                        size="small"
                                        sx={{
                                          backgroundColor: isSelected ? categoryConfig.color : '#e0e0e0',
                                          color: isSelected ? 'white' : 'text.secondary',
                                          fontWeight: 600,
                                          mr: 1
                                        }}
                                      />
                                    </div>
                                  </AccordionSummary>

                                  {isSelected && (
                                    <AccordionDetails sx={{ pt: 1, pb: 2 }}>
                                      {amenities
                                        .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
                                        .map((amenity, index) => (
                                          <Paper
                                            key={`${category}-${index}`}
                                            elevation={0}
                                            sx={{
                                              p: 2,
                                              mb: 1,
                                              backgroundColor: '#fafafa',
                                              border: '1px solid #e9ecef',
                                              borderRadius: 1,
                                              cursor: 'pointer',
                                              transition: 'all 0.2s ease',
                                              '&:hover': {
                                                backgroundColor: '#f0f0f0',
                                                boxShadow: 1
                                              }
                                            }}
                                            onClick={() => setSelectedAmenityId(amenity.id || undefined)}
                                          >
                                            <Typography variant="body2" sx={{
                                              fontWeight: 500,
                                              mb: 0.5
                                            }}>
                                              {amenity.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {amenity.distance_km ? `${amenity.distance_km.toFixed(1)} km away` : 'Distance unknown'}
                                            </Typography>
                                            {amenity.address && (
                                              <Typography variant="caption" sx={{
                                                display: 'block',
                                                color: 'text.secondary',
                                                fontStyle: 'italic',
                                                mt: 0.5
                                              }}>
                                                {amenity.address}
                                              </Typography>
                                            )}
                                          </Paper>
                                        ))
                                      }
                                    </AccordionDetails>
                                  )}
                                </Accordion>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Panel: Map */}
                    <div style={{
                      flex: '3',
                      height: '100%',
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
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          flexDirection: 'column',
                          color: 'text.secondary'
                        }}>
                          <Typography variant="h6">Map Unavailable</Typography>
                          <Typography variant="body2" sx={{ textAlign: 'center', maxWidth: 300 }}>
                            Property coordinates are not available for this listing.
                          </Typography>
                        </div>
                      )}
                    </div>
                  </div>
            )}

            {/* Schools Tab */}
            {currentTab === 2 && propertyDetails?.id && (
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 24px'
              }}>
                <SchoolsTab propertyId={propertyDetails.id} property={propertyDetails} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailPage;